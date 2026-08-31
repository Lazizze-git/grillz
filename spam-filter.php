<?php
/**
 * Filtre anti-spam du formulaire de contact.
 *
 * Cinq couches, dans l'ordre où elles se déclenchent : deux champs pièges,
 * un jeton écrit par la page, un score de contenu, une limite de fréquence
 * par adresse IP, un anti-doublon. Un branchement Cloudflare Turnstile est
 * prévu mais dormant tant qu'aucune clé secrète n'est posée.
 *
 * Principe directeur : ne jamais perdre un vrai message. Dans le doute, on
 * laisse passer. Un message écarté reçoit exactement la même réponse qu'un
 * message accepté — le robot ne doit rien pouvoir déduire de son échec.
 *
 * Ce fichier est inclus par envoi.php ; il n'est jamais appelé directement
 * (l'accès web lui est refusé par le .htaccess de la racine).
 */

declare(strict_types=1);

/** Domaine du site. Tout le fichier s'y réfère, rien n'est écrit en dur ailleurs. */
const ANTISPAM_DOMAINE = "maison-alliani.com";

/** Sel du jeton de page. Doit rester identique à celui de js/form.js. */
const ANTISPAM_SEL = "antispam-v1";

/** Au-delà de ce total, le message est écarté. */
const ANTISPAM_SEUIL = 7;

/** Un formulaire rempli plus vite que ça n'a pas été lu. */
const ANTISPAM_DELAI_MIN = 3;

/** Passé ce délai, le jeton est considéré comme périmé plutôt que valide. */
const ANTISPAM_JETON_VALIDITE = 86400;

/** Dossier de travail : journal, compteurs, empreintes. Hors du web. */
const ANTISPAM_DOSSIER = __DIR__ . "/.antispam";

/** Limite d'envois par adresse IP. */
const ANTISPAM_PAR_HEURE = 3;
const ANTISPAM_PAR_JOUR = 10;

/** Un même message renvoyé dans cette fenêtre est ignoré. */
const ANTISPAM_FENETRE_DOUBLON = 86400;

/** Champs pièges. « website » est celui que les robots remplissent d'office. */
const ANTISPAM_PIEGES = ["site", "website"];

/** Champs courts : un lien n'y a rien à faire. */
const ANTISPAM_CHAMPS_COURTS = ["prenom", "pays"];

/** Nom du champ caché qui porte le jeton de page. */
const ANTISPAM_CHAMP_JETON = "jeton";

/* ------------------------------------------------------------------ */
/* Listes de signaux                                                   */
/* ------------------------------------------------------------------ */

/** Raccourcisseurs d'URL : un vrai prospect donne l'adresse de son site. */
const ANTISPAM_RACCOURCISSEURS = [
    "cut.gl", "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy",
    "goo.gl", "ow.ly", "buff.ly", "shorturl.at", "rebrand.ly", "t.ly",
    "tiny.cc", "clck.ru", "surl.li", "u.to", "v.gd", "shrtco.de", "lnkd.in",
];

/** Extensions de domaine massivement utilisées par le spam. */
const ANTISPAM_TLD_RISQUE = [
    "xyz", "top", "icu", "club", "loan", "tk", "ml", "ga", "cf", "gq",
    "work", "click", "link", "bid", "date", "stream", "download", "review",
    "racing", "win", "party", "science", "men", "kim", "buzz", "rest",
];

/**
 * Extensions reconnues pour repérer un domaine écrit sans « http:// » ni
 * barre oblique. Volontairement courte : mieux vaut manquer un lien que
 * prendre « rappelez-moi demain.Merci » pour une adresse.
 */
const ANTISPAM_TLD_CONNUS = [
    "com", "net", "org", "info", "biz", "io", "co", "me", "app", "dev",
    "shop", "site", "online", "store", "live", "space", "fun", "pro",
    "fr", "ch", "be", "lu", "de", "it", "es", "nl", "uk", "eu", "us",
    "ca", "ru", "cn", "in", "br", "pl", "pt", "at", "se", "no", "dk",
    "xyz", "top", "icu", "club", "loan", "tk", "ml", "ga", "cf", "gq",
    "ly", "gl", "gd", "gy", "cc", "to", "tv", "ws", "sh", "st",
];

/**
 * Formules de spam. Chacune vaut 3 points, le total est plafonné à 6 :
 * les mots seuls ne doivent jamais suffire à écarter un message, il faut
 * toujours un second signal.
 */
const ANTISPAM_FORMULES = [
    "promo code", "promocode", "coupon code", "you have won", "you won",
    "casino", "crypto", "bitcoin", "forex", "binary option",
    "backlink", "backlinks", "seo services", "seo service", "seo expert",
    "guest post", "link building", "rank higher", "first page of google",
    "increase traffic", "boost your traffic", "web traffic",
    "viagra", "cialis", "porn", "sex dating", "hot singles",
    "make money", "earn money", "work from home", "passive income",
    "investment opportunity", "loan offer", "free gift", "gift card",
    "click here to claim", "limited time offer", "act now",
    "unsubscribe here", "bulk email", "mass mailing",
];

/* ------------------------------------------------------------------ */
/* Jeton de page                                                       */
/* ------------------------------------------------------------------ */

/**
 * Somme de contrôle d'un horodatage : hachage 31, tronqué sur 32 bits,
 * rendu en base 36. Doit produire exactement la même chaîne que la boucle
 * équivalente de js/form.js — l'égalité est vérifiée par les tests.
 */
function antispam_somme(int $secondes): string
{
    $source = ANTISPAM_SEL . ":" . $secondes;
    $hash = 0;

    for ($i = 0, $n = strlen($source); $i < $n; $i++) {
        $hash = ($hash * 31 + ord($source[$i])) & 0xFFFFFFFF;
    }

    return base_convert((string) $hash, 10, 36);
}

/**
 * Temps de remplissage annoncé par le jeton, en secondes.
 * Renvoie null si le jeton est absent, mal formé, faux, ou si l'horloge du
 * visiteur est trop décalée pour qu'on en tire quoi que ce soit : dans tous
 * ces cas on retombe sur la pénalité « jeton absent », jamais sur un blocage.
 */
function antispam_age_jeton(string $jeton, int $maintenant): ?int
{
    $jeton = trim($jeton);
    if ($jeton === "" || substr_count($jeton, ".") !== 1) {
        return null;
    }

    [$secondes, $somme] = explode(".", $jeton, 2);
    if ($secondes === "" || !ctype_digit($secondes)) {
        return null;
    }

    $secondes = (int) $secondes;
    if (!hash_equals(antispam_somme($secondes), $somme)) {
        return null;
    }

    $age = $maintenant - $secondes;

    /* Horloge du visiteur en avance, ou page ouverte hier : inexploitable. */
    if ($age < -60 || $age > ANTISPAM_JETON_VALIDITE) {
        return null;
    }

    return max(0, $age);
}

/* ------------------------------------------------------------------ */
/* Lecture du contenu                                                  */
/* ------------------------------------------------------------------ */

/**
 * Domaines distincts cités dans un texte.
 *
 * On compte les domaines, pas les URL brutes : « https://cut.gl/x » et
 * « cut.gl/x » désignent le même site et ne doivent compter qu'une fois.
 * Les adresses e-mail sont retirées d'abord, et le domaine du client est
 * ignoré — un visiteur a le droit de parler du site sur lequel il écrit.
 */
function antispam_domaines(string $texte): array
{
    /* Une adresse e-mail n'est pas un lien. */
    $texte = (string) preg_replace('/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/u', " ", $texte);
    $texte = mb_strtolower($texte, "UTF-8");

    $hote = '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*';
    $tlds = implode("|", ANTISPAM_TLD_CONNUS);

    $motifs = [
        /* Adresse complète : le schéma ne laisse aucun doute. */
        '~https?://(' . $hote . '\.[a-z]{2,})~',
        /* Écrite « www.quelquechose.tld ». */
        '~(?<![a-z0-9.@-])(www\.' . $hote . '\.[a-z]{2,})~',
        /* Un chemin qui suit trahit une adresse : « cut.gl/NoSNR ». */
        '~(?<![a-z0-9.@-])(' . $hote . '\.[a-z]{2,})/~',
        /* Nue, mais avec une extension reconnue. */
        '~(?<![a-z0-9.@-])(' . $hote . '\.(?:' . $tlds . '))(?![a-z0-9-])~',
    ];

    $trouves = [];

    foreach ($motifs as $motif) {
        if (!preg_match_all($motif, $texte, $lots)) {
            continue;
        }

        foreach ($lots[1] as $domaine) {
            $domaine = rtrim($domaine, ".");
            /* « www. » n'est pas un site différent. */
            if (str_starts_with($domaine, "www.")) {
                $domaine = substr($domaine, 4);
            }
            if ($domaine === "" || !str_contains($domaine, ".")) {
                continue;
            }
            if (antispam_est_le_site($domaine)) {
                continue;
            }
            $trouves[$domaine] = true;
        }
    }

    return array_keys($trouves);
}

/** Le domaine du client, ou l'un de ses sous-domaines. */
function antispam_est_le_site(string $hote): bool
{
    $hote = strtolower($hote);

    return $hote === ANTISPAM_DOMAINE
        || str_ends_with($hote, "." . ANTISPAM_DOMAINE);
}

/** Hôte d'une provenance annoncée (Origin ou Referer), sans port. */
function antispam_hote(string $url): string
{
    $url = trim($url);
    if ($url === "") {
        return "";
    }

    if (!str_contains($url, "//")) {
        $url = "//" . $url;
    }

    $hote = (string) parse_url($url, PHP_URL_HOST);
    $hote = strtolower($hote);

    return str_starts_with($hote, "www.") ? substr($hote, 4) : $hote;
}

/* ------------------------------------------------------------------ */
/* Score de contenu                                                    */
/* ------------------------------------------------------------------ */

/**
 * Additionne les signaux du message et rend le détail.
 * Une raison marquée « bloquant » écarte le message quel que soit le total :
 * elle ne laisse place à aucune interprétation bienveillante.
 *
 * @return array{score:int, raisons:string[], bloquant:bool}
 */
function antispam_score(array $post, array $server, int $maintenant): array
{
    $score = 0;
    $raisons = [];
    $bloquant = false;

    $lire = static fn(string $nom): string => trim((string) ($post[$nom] ?? ""));

    $message = $lire("message");
    $courts = [];
    foreach (ANTISPAM_CHAMPS_COURTS as $nom) {
        $courts[] = $lire($nom);
    }
    $courtsTexte = implode(" ", $courts);

    /* --- Liens dans le message --- */
    $domaines = antispam_domaines($message);
    $nombre = count($domaines);

    if ($nombre >= 3) {
        $bloquant = true;
        $raisons[] = "liens:" . $nombre . " (bloquant)";
    } elseif ($nombre === 2) {
        $score += 5;
        $raisons[] = "liens:2 (+5)";
    } elseif ($nombre === 1) {
        $score += 3;
        $raisons[] = "liens:1 (+3)";
    }

    /* --- Raccourcisseur ou extension à risque --- */
    $tousDomaines = array_unique(array_merge($domaines, antispam_domaines($courtsTexte)));
    foreach ($tousDomaines as $domaine) {
        $tld = strrchr($domaine, ".");
        $tld = $tld === false ? "" : substr($tld, 1);

        if (in_array($domaine, ANTISPAM_RACCOURCISSEURS, true)) {
            $score += 5;
            $raisons[] = "raccourcisseur:" . $domaine . " (+5)";
            break;
        }
        if (in_array($tld, ANTISPAM_TLD_RISQUE, true)) {
            $score += 5;
            $raisons[] = "extension-risque:." . $tld . " (+5)";
            break;
        }
    }

    /* --- Balise de lien : personne n'écrit ça dans un vrai message --- */
    if (preg_match('~\[url[\]=]|\[/url\]|<a\s+[^>]*href~i', $message . " " . $courtsTexte)) {
        $score += 5;
        $raisons[] = "balise-lien (+5)";
    }

    /* --- Lien dans un champ court (prénom, pays) --- */
    if ($courtsTexte !== "" && (antispam_domaines($courtsTexte) !== [] || preg_match('~https?://~i', $courtsTexte))) {
        $score += 5;
        $raisons[] = "lien-champ-court (+5)";
    }

    /* --- Formules de spam, plafonnées à 6 --- */
    $bacASable = mb_strtolower($message . " " . $courtsTexte, "UTF-8");
    $formules = 0;
    $vues = [];
    foreach (ANTISPAM_FORMULES as $formule) {
        if (str_contains($bacASable, $formule)) {
            $formules++;
            $vues[] = $formule;
        }
    }
    if ($formules > 0) {
        $points = min($formules * 3, 6);
        $score += $points;
        $raisons[] = "formules:" . implode(",", array_slice($vues, 0, 3)) . " (+" . $points . ")";
    }

    /* --- Alphabets hors clientèle : la maison écrit en français et en anglais --- */
    if (preg_match('/[\x{0400}-\x{04FF}\x{0600}-\x{06FF}\x{4E00}-\x{9FFF}\x{3040}-\x{30FF}\x{AC00}-\x{D7AF}]/u', $message . $courtsTexte)) {
        $score += 3;
        $raisons[] = "alphabet-hors-clientele (+3)";
    }

    /* --- Jeton de page --- */
    $age = antispam_age_jeton((string) ($post[ANTISPAM_CHAMP_JETON] ?? ""), $maintenant);
    if ($age === null) {
        $score += 3;
        $raisons[] = "jeton-absent (+3)";
    } elseif ($age < ANTISPAM_DELAI_MIN) {
        $score += 4;
        $raisons[] = "rempli-en-" . $age . "s (+4)";
    }

    /* --- Provenance --- */
    $origine = (string) ($server["HTTP_ORIGIN"] ?? "");
    $referent = (string) ($server["HTTP_REFERER"] ?? "");
    $annonce = antispam_hote($origine) ?: antispam_hote($referent);

    if ($annonce === "") {
        $score += 2;
        $raisons[] = "provenance-absente (+2)";
    } elseif (!antispam_est_le_site($annonce) && $annonce !== antispam_hote((string) ($server["HTTP_HOST"] ?? ""))) {
        /* Le formulaire a été recopié ailleurs : rien à discuter. */
        $bloquant = true;
        $raisons[] = "provenance-etrangere:" . $annonce . " (bloquant)";
    }

    /* --- Message trop court pour porter une demande --- */
    if (mb_strlen($message, "UTF-8") < 20) {
        $score += 2;
        $raisons[] = "message-court (+2)";
    }

    return ["score" => $score, "raisons" => $raisons, "bloquant" => $bloquant];
}

/* ------------------------------------------------------------------ */
/* Dossier de travail                                                  */
/* ------------------------------------------------------------------ */

/**
 * Dossier de travail, créé au besoin, muni de son propre .htaccess.
 * Il se recrée seul côté serveur : le déploiement FTP ne l'emporte pas
 * avec lui, et rien de tout cela n'a besoin d'être versionné.
 *
 * Renvoie null si l'écriture est impossible — auquel cas la limite de
 * fréquence et l'anti-doublon se taisent plutôt que de bloquer des envois
 * légitimes.
 */
function antispam_dossier(): ?string
{
    static $resolu = false;
    static $chemin = null;

    if ($resolu) {
        return $chemin;
    }
    $resolu = true;

    $dossier = ANTISPAM_DOSSIER;

    if (!is_dir($dossier) && !@mkdir($dossier, 0700, true) && !is_dir($dossier)) {
        return $chemin = null;
    }
    if (!is_writable($dossier)) {
        return $chemin = null;
    }

    $garde = $dossier . "/.htaccess";
    if (!is_file($garde)) {
        @file_put_contents($garde, implode("\n", [
            "# Dossier de travail du filtre anti-spam : rien n'y est public.",
            "<IfModule mod_authz_core.c>",
            "  Require all denied",
            "</IfModule>",
            "<IfModule !mod_authz_core.c>",
            "  Order allow,deny",
            "  Deny from all",
            "</IfModule>",
            "",
        ]));
    }

    return $chemin = $dossier;
}

/**
 * Lit, modifie et réécrit un fichier JSON sous verrou.
 * Le verrou porte sur le fichier lui-même : deux envois simultanés ne
 * peuvent pas se perdre l'un l'autre. Toute défaillance rend null, et
 * l'appelant laisse alors passer.
 */
function antispam_json(string $nom, callable $modifier): mixed
{
    $dossier = antispam_dossier();
    if ($dossier === null) {
        return null;
    }

    $fichier = $dossier . "/" . $nom;
    $flux = @fopen($fichier, "c+");
    if ($flux === false) {
        return null;
    }

    try {
        if (!flock($flux, LOCK_EX)) {
            return null;
        }

        $brut = (string) stream_get_contents($flux);
        $donnees = $brut === "" ? [] : json_decode($brut, true);
        if (!is_array($donnees)) {
            $donnees = [];
        }

        $retour = $modifier($donnees);

        ftruncate($flux, 0);
        rewind($flux);
        fwrite($flux, json_encode($donnees, JSON_UNESCAPED_UNICODE));
        fflush($flux);
        flock($flux, LOCK_UN);

        return $retour;
    } finally {
        fclose($flux);
    }
}

/* ------------------------------------------------------------------ */
/* Limite de fréquence et anti-doublon                                 */
/* ------------------------------------------------------------------ */

/** Adresse IP de l'appelant, telle que la voit le serveur. */
function antispam_ip(array $server): string
{
    return (string) ($server["REMOTE_ADDR"] ?? "0.0.0.0");
}

/**
 * Vrai si l'adresse a déjà trop écrit. Les horodatages sont rangés sous une
 * empreinte de l'IP : le dossier ne conserve pas la liste en clair.
 */
function antispam_trop_frequent(string $ip, int $maintenant): bool
{
    $cle = hash("sha256", ANTISPAM_SEL . "|" . $ip);

    $verdict = antispam_json("frequence.json", function (array &$donnees) use ($cle, $maintenant): bool {
        /* Purge d'abord : le fichier ne doit pas grossir indéfiniment. */
        foreach ($donnees as $k => $liste) {
            $liste = array_values(array_filter(
                is_array($liste) ? $liste : [],
                static fn($t): bool => is_int($t) && $maintenant - $t < 86400
            ));
            if ($liste === []) {
                unset($donnees[$k]);
            } else {
                $donnees[$k] = $liste;
            }
        }

        $siennes = $donnees[$cle] ?? [];
        $heure = count(array_filter($siennes, static fn(int $t): bool => $maintenant - $t < 3600));
        $jour = count($siennes);

        if ($heure >= ANTISPAM_PAR_HEURE || $jour >= ANTISPAM_PAR_JOUR) {
            return true;
        }

        $siennes[] = $maintenant;
        $donnees[$cle] = $siennes;

        return false;
    });

    /* Stockage indisponible : on ne prive personne d'un envoi pour autant. */
    return $verdict === true;
}

/** Empreinte d'un message : l'adresse et le texte, ponctuation et casse mises de côté. */
function antispam_empreinte(string $email, string $message): string
{
    $normalise = mb_strtolower(trim($email . "|" . $message), "UTF-8");
    $normalise = (string) preg_replace('/[^\p{L}\p{N}@]+/u', " ", $normalise);
    $normalise = trim((string) preg_replace('/\s+/', " ", $normalise));

    return hash("sha256", $normalise);
}

/** Vrai si ce message exact est déjà passé dans les dernières 24 h. */
function antispam_doublon(string $email, string $message, int $maintenant): bool
{
    $empreinte = antispam_empreinte($email, $message);

    $verdict = antispam_json("empreintes.json", function (array &$donnees) use ($empreinte, $maintenant): bool {
        foreach ($donnees as $k => $t) {
            if (!is_int($t) || $maintenant - $t >= ANTISPAM_FENETRE_DOUBLON) {
                unset($donnees[$k]);
            }
        }

        $connu = isset($donnees[$empreinte]);
        $donnees[$empreinte] = $maintenant;

        return $connu;
    });

    return $verdict === true;
}

/* ------------------------------------------------------------------ */
/* Cloudflare Turnstile — prévu, dormant                               */
/* ------------------------------------------------------------------ */

/**
 * Clé secrète Turnstile, si elle a été posée côté serveur : variable
 * d'environnement, ou constante définie avant l'inclusion de ce fichier.
 * Tant qu'elle est vide, la couche entière est inerte.
 */
function antispam_cle_turnstile(): string
{
    $cle = (string) (getenv("TURNSTILE_SECRET") ?: "");

    if ($cle === "" && defined("TURNSTILE_SECRET")) {
        $cle = (string) constant("TURNSTILE_SECRET");
    }

    return trim($cle);
}

/**
 * Vérifie le jeton Turnstile. Rend vrai — donc laisse passer — tant qu'aucune
 * clé n'est configurée, et aussi si Cloudflare est injoignable : une panne
 * chez un tiers ne doit pas fermer le formulaire du client.
 */
function antispam_turnstile(array $post, string $ip): bool
{
    $cle = antispam_cle_turnstile();
    if ($cle === "") {
        return true;
    }

    $reponse = trim((string) ($post["cf-turnstile-response"] ?? ""));
    if ($reponse === "") {
        return false;
    }

    $contexte = stream_context_create([
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/x-www-form-urlencoded\r\n",
            "content" => http_build_query([
                "secret" => $cle,
                "response" => $reponse,
                "remoteip" => $ip,
            ]),
            "timeout" => 5,
            "ignore_errors" => true,
        ],
    ]);

    $brut = @file_get_contents(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        false,
        $contexte
    );

    if ($brut === false) {
        return true;
    }

    $json = json_decode($brut, true);

    return is_array($json) ? ($json["success"] ?? false) === true : true;
}

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

/**
 * Consigne une décision, pour pouvoir relire les faux positifs.
 * Le journal vit dans le dossier de travail, interdit d'accès web.
 */
function antispam_journaliser(string $verdict, int $score, array $raisons, string $ip, array $post): void
{
    $dossier = antispam_dossier();
    if ($dossier === null) {
        return;
    }

    $extrait = (string) ($post["message"] ?? "");
    $extrait = (string) preg_replace('/\s+/u', " ", trim($extrait));
    $extrait = mb_substr($extrait, 0, 160, "UTF-8");

    $ligne = implode(" | ", [
        gmdate("Y-m-d H:i:s") . "Z",
        str_pad($verdict, 8),
        "score=" . $score,
        "ip=" . $ip,
        "de=" . mb_substr(trim((string) ($post["email"] ?? "—")), 0, 60, "UTF-8"),
        "raisons=" . ($raisons ? implode(", ", $raisons) : "—"),
        "extrait=" . $extrait,
    ]);

    @file_put_contents($dossier . "/journal.log", $ligne . "\n", FILE_APPEND | LOCK_EX);
}

/* ------------------------------------------------------------------ */
/* Entrées publiques                                                   */
/* ------------------------------------------------------------------ */

/** Vrai si l'un des champs pièges a été rempli. Un visiteur ne les voit pas. */
function antispam_piege_declenche(array $post): bool
{
    foreach (ANTISPAM_PIEGES as $nom) {
        if (trim((string) ($post[$nom] ?? "")) !== "") {
            return true;
        }
    }

    return false;
}

/**
 * Verdict complet sur une soumission.
 *
 * Les couches coûteuses passent en dernier : on ne touche au stockage ni au
 * réseau que pour un message qui a déjà franchi le score.
 *
 * @return array{accepte:bool, score:int, raisons:string[], ip:string}
 */
function antispam_filtrer(array $post, array $server): array
{
    $maintenant = time();
    $ip = antispam_ip($server);

    /* 1 — Champs pièges. */
    if (antispam_piege_declenche($post)) {
        antispam_journaliser("ECARTE", 99, ["champ-piege (bloquant)"], $ip, $post);

        return ["accepte" => false, "score" => 99, "raisons" => ["champ-piege"], "ip" => $ip];
    }

    /* 2 et 3 — Jeton de page et score de contenu. */
    $bilan = antispam_score($post, $server, $maintenant);
    $score = $bilan["score"];
    $raisons = $bilan["raisons"];

    if ($bilan["bloquant"] || $score >= ANTISPAM_SEUIL) {
        antispam_journaliser("ECARTE", $score, $raisons, $ip, $post);

        return ["accepte" => false, "score" => $score, "raisons" => $raisons, "ip" => $ip];
    }

    /* Turnstile, si et seulement si une clé a été posée. */
    if (!antispam_turnstile($post, $ip)) {
        $raisons[] = "turnstile-refuse (bloquant)";
        antispam_journaliser("ECARTE", $score, $raisons, $ip, $post);

        return ["accepte" => false, "score" => $score, "raisons" => $raisons, "ip" => $ip];
    }

    /* 5 — Anti-doublon. Il passe avant la limite de fréquence : un visiteur
       qui renvoie deux fois le même message — double clic, doute sur l'envoi —
       ne doit pas y consommer son quota horaire pour rien. */
    $email = trim((string) ($post["email"] ?? ""));
    $message = (string) ($post["message"] ?? "");
    if (antispam_doublon($email, $message, $maintenant)) {
        $raisons[] = "doublon-24h (bloquant)";
        antispam_journaliser("ECARTE", $score, $raisons, $ip, $post);

        return ["accepte" => false, "score" => $score, "raisons" => $raisons, "ip" => $ip];
    }

    /* 4 — Limite de fréquence par adresse IP. */
    if (antispam_trop_frequent($ip, $maintenant)) {
        $raisons[] = "trop-frequent (bloquant)";
        antispam_journaliser("ECARTE", $score, $raisons, $ip, $post);

        return ["accepte" => false, "score" => $score, "raisons" => $raisons, "ip" => $ip];
    }

    antispam_journaliser("ACCEPTE", $score, $raisons, $ip, $post);

    return ["accepte" => true, "score" => $score, "raisons" => $raisons, "ip" => $ip];
}
