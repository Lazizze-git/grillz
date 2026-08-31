<?php
/**
 * Passe le filtre sur des cas réels et rend le tableau des scores.
 *
 *   php tests/antispam.php
 *
 * Les compteurs de fréquence et les empreintes sont remis à zéro au
 * démarrage : deux exécutions de suite doivent donner le même tableau.
 */

declare(strict_types=1);

require __DIR__ . "/../spam-filter.php";

foreach (["frequence.json", "empreintes.json"] as $fichier) {
    @unlink(ANTISPAM_DOSSIER . "/" . $fichier);
}

$ORIGINE = ["HTTP_ORIGIN" => "https://" . ANTISPAM_DOMAINE, "REMOTE_ADDR" => "203.0.113.7"];

/** Jeton valide, rempli il y a $age secondes. */
function jeton(int $age): string
{
    $s = time() - $age;
    return $s . "." . antispam_somme($s);
}

/* Cas : [libellé, doit passer ?, champs, en-têtes] */
$cas = [
    // ---- Doivent être bloqués -------------------------------------------
    ["Larrynes — sans jeton (POST direct)", false, [
        "prenom" => "Larrynes",
        "email" => "stefff.b@web.de",
        "budget" => "114144",
        "message" => "Get ready to win with a \$25,000 promo code https://cut.gl/NoSNR",
    ], ["REMOTE_ADDR" => "203.0.113.9"]],

    ["Larrynes — avec jeton et provenance", false, [
        "prenom" => "Larrynes",
        "email" => "stefff.b@web.de",
        "budget" => "114144",
        "message" => "Get ready to win with a \$25,000 promo code https://cut.gl/NoSNR",
        "jeton" => jeton(40),
    ], $ORIGINE],

    ["Spam SEO / backlinks", false, [
        "prenom" => "Mike",
        "email" => "mike@seopro.example",
        "message" => "Hello, we provide seo services and high quality backlinks to rank higher on Google. Details on https://seo-boost.top today.",
        "jeton" => jeton(30),
    ], $ORIGINE],

    ["Raccourcisseur d'URL", false, [
        "prenom" => "Ann",
        "email" => "ann@example.com",
        "message" => "Nice site, check this out https://bit.ly/3xKq2 it is amazing for your business.",
        "jeton" => jeton(30),
    ], $ORIGINE],

    ["Formulaire posté depuis un autre domaine", false, [
        "prenom" => "Julie",
        "email" => "julie@example.com",
        "message" => "Bonjour, je souhaiterais un devis pour une pièce sur mesure, merci beaucoup.",
        "jeton" => jeton(60),
    ], ["HTTP_ORIGIN" => "https://spam-farm.example", "REMOTE_ADDR" => "198.51.100.4"]],

    ["Champ piège « website » rempli", false, [
        "prenom" => "Bot",
        "email" => "bot@example.com",
        "website" => "http://spam.example",
        "message" => "Bonjour, je voudrais un devis pour une pièce en or jaune s'il vous plaît.",
        "jeton" => jeton(60),
    ], $ORIGINE],

    ["Rempli en une seconde, avec un lien", false, [
        "prenom" => "Speed",
        "email" => "speed@example.com",
        "message" => "hi https://promo-deal.example",
        "jeton" => jeton(0),
    ], $ORIGINE],

    ["Trois domaines dans le message", false, [
        "prenom" => "Alex",
        "email" => "alex@example.com",
        "message" => "Voir a-site.com, b-site.net et aussi https://c-site.org pour comparer les offres du moment.",
        "jeton" => jeton(60),
    ], $ORIGINE],

    ["Balise BBCode", false, [
        "prenom" => "Ivan",
        "email" => "ivan@example.com",
        "message" => "Отличное предложение [url=http://casino-win.icu]click here to claim[/url] прямо сейчас.",
        "jeton" => jeton(60),
    ], $ORIGINE],

    // ---- Doivent passer --------------------------------------------------
    ["Demande de devis classique", true, [
        "prenom" => "Camille",
        "email" => "camille.dupont@gmail.com",
        "pays" => "Suisse",
        "message" => "Bonjour, je souhaiterais un grillz pleine bouche en or jaune pour cet automne. Quel serait le délai et le budget à prévoir ? Merci d'avance.",
        "jeton" => jeton(180),
    ], $ORIGINE],

    ["Prospect qui donne l'adresse de son site", true, [
        "prenom" => "Thomas",
        "email" => "thomas@atelier-tm.ch",
        "pays" => "Suisse",
        "message" => "Bonjour, notre site est https://atelier-tm.ch et nous aimerions discuter d'une collaboration autour d'une pièce sur mesure.",
        "jeton" => jeton(150),
    ], $ORIGINE],

    ["Message court mais réel", true, [
        "prenom" => "Sofia",
        "email" => "sofia@example.com",
        "message" => "Bonjour, on peut se voir cette semaine ?",
        "jeton" => jeton(45),
    ], $ORIGINE],

    ["Client étranger, en anglais", true, [
        "prenom" => "James",
        "email" => "james.carter@example.co.uk",
        "pays" => "United Kingdom",
        "message" => "Hello, I am travelling to Lausanne next month and would love to book a fitting for a full set. What is your availability?",
        "jeton" => jeton(200),
    ], $ORIGINE],

    ["Envoi sans JavaScript, avec un lien", true, [
        "prenom" => "Nadia",
        "email" => "nadia@studio-nadia.fr",
        "message" => "Bonjour, j'ai découvert votre travail et je prépare un projet. Mon portfolio est sur studio-nadia.fr si vous voulez voir mon univers.",
        /* Pas de jeton : le JavaScript ne s'est pas exécuté. */
    ], ["HTTP_REFERER" => "https://" . ANTISPAM_DOMAINE . "/contact", "REMOTE_ADDR" => "203.0.113.20"]],

    ["Sans message du tout, formulaire complet", true, [
        "prenom" => "Léa",
        "email" => "lea@example.com",
        "pays" => "France",
        "piece" => "crocs",
        "message" => "",
        "jeton" => jeton(90),
    ], $ORIGINE],

    /* Volontairement acceptée : 4 points pour la vitesse, 2 pour la brièveté,
       soit 6 — sous le seuil. Les formules et la vitesse ne bloquent jamais
       seules, il faut toujours un second signal. Un visiteur pressé sur un
       formulaire pré-rempli par son navigateur ne doit pas être écarté. */
    ["Rempli en une seconde, sans autre signal", true, [
        "prenom" => "Pressé",
        "email" => "presse@example.com",
        "message" => "Rappel svp",
        "jeton" => jeton(1),
    ], $ORIGINE],

    ["Visiteur qui cite le site de la maison", true, [
        "prenom" => "Marc",
        "email" => "marc@example.com",
        "message" => "J'ai vu sur maison-alliani.com/galerie la pièce en argent, je voudrais la même en or blanc.",
        "jeton" => jeton(120),
    ], $ORIGINE],
];

/* Chaque cas part d'une IP distincte et d'un stockage neuf : on mesure ici le
   score de contenu, pas la fréquence — celle-ci a son propre test. */
$largeur = 0;
foreach ($cas as $c) {
    $largeur = max($largeur, mb_strlen($c[0]));
}

printf("%-{$largeur}s | %-7s | %-6s | %-5s | %s\n", "Cas", "Attendu", "Obtenu", "Score", "Raisons");
echo str_repeat("-", $largeur + 60), "\n";

$echecs = 0;
$n = 0;

foreach ($cas as [$libelle, $doitPasser, $post, $server]) {
    /* IP unique par cas : la limite de fréquence ne doit pas fausser la lecture. */
    $server["REMOTE_ADDR"] = "203.0.113." . (++$n);
    $server["HTTP_HOST"] = ANTISPAM_DOMAINE;

    $r = antispam_filtrer($post, $server);
    $ok = $r["accepte"] === $doitPasser;
    if (!$ok) {
        $echecs++;
    }

    printf(
        "%-{$largeur}s | %-7s | %-6s | %-5s | %s\n",
        $libelle,
        $doitPasser ? "passe" : "bloque",
        $r["accepte"] ? "passe" : "bloque",
        $r["score"],
        ($ok ? "" : "*** ECHEC *** ") . implode(", ", $r["raisons"])
    );
}

echo "\n";

/* --- Limite de fréquence : 3 envois par heure depuis la même adresse --- */
$ipFixe = "198.51.100.77";
$base = [
    "prenom" => "Camille",
    "email" => "camille@example.com",
    "pays" => "Suisse",
    "jeton" => jeton(120),
];
$srv = ["HTTP_ORIGIN" => "https://" . ANTISPAM_DOMAINE, "HTTP_HOST" => ANTISPAM_DOMAINE, "REMOTE_ADDR" => $ipFixe];

echo "Limite de fréquence (3/heure, même IP, messages tous différents) :\n";
for ($i = 1; $i <= 4; $i++) {
    $post = $base + ["message" => "Bonjour, je reviens vers vous au sujet du projet numéro " . $i . ", merci."];
    $r = antispam_filtrer($post, $srv);
    $attendu = $i <= ANTISPAM_PAR_HEURE;
    $ok = $r["accepte"] === $attendu;
    if (!$ok) {
        $echecs++;
    }
    printf("  envoi %d : %-6s (attendu %-6s) %s\n", $i, $r["accepte"] ? "passe" : "bloque", $attendu ? "passe" : "bloque", $ok ? "" : "*** ECHEC ***");
}

/* --- Anti-doublon : le même message renvoyé --- */
echo "\nAnti-doublon (même e-mail, même message, IP différente) :\n";
$msg = "Bonjour, je souhaite un rendez-vous pour un devis, merci de me rappeler.";
foreach ([1, 2] as $i) {
    $r = antispam_filtrer(
        ["prenom" => "Doublon", "email" => "doublon@example.com", "message" => $msg, "jeton" => jeton(120)],
        ["HTTP_ORIGIN" => "https://" . ANTISPAM_DOMAINE, "HTTP_HOST" => ANTISPAM_DOMAINE, "REMOTE_ADDR" => "198.51.100.8" . $i]
    );
    $attendu = $i === 1;
    $ok = $r["accepte"] === $attendu;
    if (!$ok) {
        $echecs++;
    }
    printf("  envoi %d : %-6s (attendu %-6s) %s\n", $i, $r["accepte"] ? "passe" : "bloque", $attendu ? "passe" : "bloque", $ok ? "" : "*** ECHEC ***");
}

/* --- L'anti-doublon passe avant la limite de fréquence ---
   Un visiteur qui reclique sur un envoi qui lui semble lent renvoie le même
   message. Si la fréquence était vérifiée d'abord, chaque renvoi identique
   lui coûterait un envoi de son quota, et son message suivant — bien réel —
   serait écarté en silence. Les trois derniers doivent passer. */
echo "\nTrois envois identiques puis deux messages différents (même IP) :\n";

$ipReclic = "198.51.100.42";
$srvReclic = ["HTTP_ORIGIN" => "https://" . ANTISPAM_DOMAINE, "HTTP_HOST" => ANTISPAM_DOMAINE, "REMOTE_ADDR" => $ipReclic];
$identique = "Bonjour, je souhaiterais un grillz pleine bouche en or jaune. Quel serait le délai ?";

$scenario = [
    ["identique 1/3", $identique, true],
    ["identique 2/3", $identique, false],
    ["identique 3/3", $identique, false],
    ["nouveau message 1/2", "Finalement je préfère de l'or blanc, est-ce possible ?", true],
    ["nouveau message 2/2", "Et pouvez-vous me dire si vous recevez le samedi matin ?", true],
];

foreach ($scenario as [$libelle, $message, $attendu]) {
    $r = antispam_filtrer(
        ["prenom" => "Camille", "email" => "camille.reclic@example.com", "pays" => "Suisse", "message" => $message, "jeton" => jeton(90)],
        $srvReclic
    );
    $ok = $r["accepte"] === $attendu;
    if (!$ok) {
        $echecs++;
    }
    printf(
        "  %-20s : %-6s (attendu %-6s) %s%s\n",
        $libelle,
        $r["accepte"] ? "passe" : "bloque",
        $attendu ? "passe" : "bloque",
        $r["raisons"] ? implode(", ", $r["raisons"]) : "",
        $ok ? "" : " *** ECHEC ***"
    );
}

echo "\n", $echecs === 0 ? "Tous les cas sont conformes.\n" : $echecs . " cas non conforme(s).\n";

exit($echecs === 0 ? 0 : 1);
