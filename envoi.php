<?php
/**
 * Réception du formulaire de co-création.
 * Valide les champs, assemble un e-mail — texte lisible + photos en pièces
 * jointes — et l'envoie à l'atelier. Répond toujours en JSON, que le
 * formulaire lit pour afficher l'écran de succès ou un message d'erreur.
 */

declare(strict_types=1);

/** Adresse qui reçoit les demandes. */
const DESTINATAIRE = "alan.alliani2503@gmail.com";

/** Expéditeur technique : doit appartenir au domaine, sinon SPF rejette l'envoi. */
const EXPEDITEUR = "contact@maison-alliani.com";

const MAX_FICHIERS = 5;
const MAX_OCTETS = 4194304;   /* 4 Mo par photo */
const MAX_TOTAL = 12582912;   /* 12 Mo toutes photos confondues */

header("Content-Type: application/json; charset=utf-8");

/* Une erreur PHP ne doit jamais s'afficher dans la réponse : le formulaire
   attend du JSON, et le message trahirait le chemin du site sur le serveur. */
ini_set("display_errors", "0");

/** Termine la requête sur une réponse JSON. */
function repondre(int $code, array $corps): never
{
    http_response_code($code);
    echo json_encode($corps, JSON_UNESCAPED_UNICODE);
    exit;
}

/* Filet de sécurité : même une erreur fatale répond en JSON. */
register_shutdown_function(function (): void {
    $erreur = error_get_last();
    if ($erreur && in_array($erreur["type"], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        error_log("envoi.php : " . $erreur["message"]);
        if (!headers_sent()) http_response_code(500);
        echo json_encode(["ok" => false, "error" => "Le serveur n'a pas pu envoyer le message."], JSON_UNESCAPED_UNICODE);
    }
});

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    repondre(405, ["ok" => false, "error" => "Méthode non autorisée."]);
}

/* Au-delà de la limite d'upload de PHP, $_POST arrive vide : on le dit clairement. */
if (!$_POST && (int) ($_SERVER["CONTENT_LENGTH"] ?? 0) > 0) {
    repondre(413, ["ok" => false, "error" => "Vos photos sont trop lourdes."]);
}

/* Piège à robots : le champ est hors écran, un visiteur ne le remplit jamais.
   On répond « envoyé » sans rien faire, pour ne pas renseigner le spammeur. */
if (trim((string) ($_POST["site"] ?? "")) !== "") {
    repondre(200, ["ok" => true]);
}

/** Valeur nettoyée d'un champ du formulaire. */
function champ(string $nom): string
{
    return trim((string) ($_POST[$nom] ?? ""));
}

$prenom = champ("prenom");
$email = champ("email");

if ($prenom === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    repondre(422, ["ok" => false, "error" => "Prénom ou adresse e-mail manquants."]);
}

/* Aucun saut de ligne dans ce qui part en en-tête : c'est la porte d'entrée
   classique pour injecter des destinataires cachés. */
$email = str_replace(["\r", "\n"], "", $email);
$prenomEntete = (string) preg_replace('/[\r\n]+/', " ", $prenom);

/* Les choix arrivent en valeurs techniques : on les relit en clair.
   Une valeur inconnue est renvoyée telle quelle plutôt que perdue. */
const LIBELLES = [
    "pleine-bouche" => "Pleine bouche",
    "crocs" => "Crocs",
    "individuelles" => "Dents individuelles",
    "custom" => "Custom",
    "or-jaune" => "Or jaune",
    "or-blanc" => "Or blanc",
    "argent-925" => "Argent 925",
    "chrome-cobalt" => "Chrome-cobalt",
    "flexible" => "Flexible",
    "1-mois" => "Sous 1 mois",
    "urgent" => "Urgent",
];

/**
 * Libellé lisible d'un choix du formulaire.
 * La page envoie le libellé affiché au visiteur (« <nom>_label ») : c'est lui
 * qui fait foi, pour que l'e-mail reflète ce qui est écrit dans le CMS.
 */
function libelle(string $nom): string
{
    $valeur = champ($nom);
    if ($valeur === "") return "—";
    $affiche = champ($nom . "_label");
    if ($affiche !== "") return mb_substr($affiche, 0, 120);
    return LIBELLES[$valeur] ?? $valeur;
}

$budget = champ("budget");
$texte = implode("\r\n", [
    "Nouvelle demande déposée sur maison-alliani.com",
    "",
    "Prénom       : " . $prenom,
    "E-mail       : " . $email,
    "Pays         : " . (champ("pays") ?: "—"),
    "",
    "Type de pièce: " . libelle("piece"),
    "Matériau     : " . libelle("materiau"),
    "Budget       : " . ($budget !== "" ? number_format((float) $budget, 0, ",", " ") . " CHF" : "—"),
    "Date visée   : " . (champ("date") ?: "—"),
    "Urgence      : " . libelle("urgence"),
    "",
    "Message :",
    champ("message") ?: "—",
    "",
]);

/* Photos de référence : on ne garde que de vraies images, dans les limites fixées. */
$pieces = [];
$total = 0;
$envois = $_FILES["refs"] ?? null;

if (is_array($envois) && isset($envois["name"]) && is_array($envois["name"])) {
    $nombre = count($envois["name"]);

    for ($i = 0; $i < $nombre; $i++) {
        /* La limite porte sur les photos retenues : une image écartée ne
           doit pas priver le client de celles qui suivent. */
        if (count($pieces) >= MAX_FICHIERS) break;
        if ((int) $envois["error"][$i] !== UPLOAD_ERR_OK) continue;

        $taille = (int) $envois["size"][$i];
        if ($taille <= 0 || $taille > MAX_OCTETS) continue;
        if ($total + $taille > MAX_TOTAL) break;

        $source = (string) $envois["tmp_name"][$i];
        if (!is_uploaded_file($source)) continue;

        /* Le type déclaré par le navigateur ne vaut rien : on lit le fichier. */
        $type = (string) (new finfo(FILEINFO_MIME_TYPE))->file($source);
        if (!str_starts_with($type, "image/")) continue;

        $contenu = file_get_contents($source);
        if ($contenu === false) continue;

        $total += $taille;
        $pieces[] = [
            "nom" => (string) preg_replace('/[^A-Za-z0-9._-]/', "_", basename((string) $envois["name"][$i])),
            "type" => $type,
            "data" => chunk_split(base64_encode($contenu)),
        ];
    }
}

/** Encode un texte pour un en-tête : les accents n'y passent pas en clair. */
function entete(string $texte): string
{
    return "=?UTF-8?B?" . base64_encode($texte) . "?=";
}

/* Identifiants SMTP : écrits sur le serveur au déploiement, jamais dans le dépôt. */
$fichierSmtp = __DIR__ . "/smtp-config.php";
$configSmtp = is_file($fichierSmtp) ? require $fichierSmtp : null;
$parSmtp = is_array($configSmtp) && !empty($configSmtp["password"]);

/* Gmail n'expédie qu'au nom du compte connecté : c'est lui qui signe l'envoi. */
$expediteur = $parSmtp ? (string) ($configSmtp["user"] ?? DESTINATAIRE) : EXPEDITEUR;

/* Reply-To sur le client : répondre depuis sa boîte suffit à ouvrir l'échange. */
$entetes = [
    "From: " . entete("Maison Alliani") . " <" . $expediteur . ">",
    "Reply-To: " . entete($prenomEntete) . " <" . $email . ">",
    "MIME-Version: 1.0",
];

if ($pieces) {
    $limite = "=_" . bin2hex(random_bytes(16));
    $entetes[] = 'Content-Type: multipart/mixed; boundary="' . $limite . '"';

    $corps = "--" . $limite . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $texte . "\r\n";

    foreach ($pieces as $piece) {
        $corps .= "--" . $limite . "\r\n"
            . "Content-Type: " . $piece["type"] . '; name="' . $piece["nom"] . '"' . "\r\n"
            . "Content-Transfer-Encoding: base64\r\n"
            . 'Content-Disposition: attachment; filename="' . $piece["nom"] . '"' . "\r\n\r\n"
            . $piece["data"] . "\r\n";
    }

    $corps .= "--" . $limite . "--";
} else {
    $entetes[] = "Content-Type: text/plain; charset=UTF-8";
    $corps = $texte;
}

$sujet = entete("Nouvelle demande — " . $prenom);

/**
 * Envoi par SMTP authentifié via le compte Gmail de l'atelier : la fonction
 * mail() est désactivée chez Infomaniak, et un message non authentifié finit
 * souvent en indésirables. Lance une exception au moindre refus.
 */
function smtp(array $config, string $expediteur, string $sujet, string $corps, array $entetes): void
{
    $hote = (string) ($config["host"] ?? "smtp.gmail.com");
    $port = (int) ($config["port"] ?? 465);
    $prefixe = $port === 465 ? "ssl://" : "tcp://";

    $flux = stream_socket_client($prefixe . $hote . ":" . $port, $no, $msg, 15);
    if (!$flux) throw new RuntimeException("Connexion SMTP impossible : " . $msg);
    stream_set_timeout($flux, 15);

    /* Lit une réponse, éventuellement sur plusieurs lignes, et vérifie son code. */
    $lire = function (int $attendu) use ($flux): void {
        $reponse = "";
        while (($ligne = fgets($flux, 1024)) !== false) {
            $reponse .= $ligne;
            if (strlen($ligne) < 4 || $ligne[3] === " ") break;
        }
        if ((int) substr($reponse, 0, 3) !== $attendu) {
            throw new RuntimeException("SMTP : " . trim($reponse));
        }
    };
    $dire = function (string $commande, int $attendu) use ($flux, $lire): void {
        fwrite($flux, $commande . "\r\n");
        $lire($attendu);
    };

    $lire(220);
    $dire("EHLO maison-alliani.com", 250);
    if ($port === 587) {
        $dire("STARTTLS", 220);
        if (!stream_socket_enable_crypto($flux, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException("SMTP : chiffrement refusé.");
        }
        $dire("EHLO maison-alliani.com", 250);
    }
    $dire("AUTH LOGIN", 334);
    $dire(base64_encode((string) $config["user"]), 334);
    $dire(base64_encode((string) $config["password"]), 235);
    $dire("MAIL FROM:<" . $expediteur . ">", 250);
    $dire("RCPT TO:<" . DESTINATAIRE . ">", 250);
    $dire("DATA", 354);

    /* mail() ajoute lui-même To et Subject : en SMTP, c'est à nous de le faire. */
    $message = implode("\r\n", array_merge([
        "Date: " . date("r"),
        "To: <" . DESTINATAIRE . ">",
        "Subject: " . $sujet,
        "Message-ID: <" . bin2hex(random_bytes(12)) . "@maison-alliani.com>",
    ], $entetes)) . "\r\n\r\n" . $corps;

    /* Une ligne qui commence par un point serait lue comme la fin du message. */
    $message = (string) preg_replace('/^\./m', "..", str_replace(["\r\n", "\n"], ["\n", "\r\n"], $message));
    $dire($message . "\r\n.", 250);
    $dire("QUIT", 221);
    fclose($flux);
}

try {
    if ($parSmtp) {
        smtp($configSmtp, $expediteur, $sujet, $corps, $entetes);
    } elseif (function_exists("mail")) {
        if (!mail(DESTINATAIRE, $sujet, $corps, implode("\r\n", $entetes), "-f" . EXPEDITEUR)) {
            throw new RuntimeException("mail() a refusé l'envoi.");
        }
    } else {
        throw new RuntimeException("Ni SMTP configuré, ni fonction mail() disponible.");
    }
} catch (Throwable $e) {
    error_log("envoi.php : " . $e->getMessage());
    repondre(500, ["ok" => false, "error" => "Le serveur n'a pas pu envoyer le message."]);
}

repondre(200, ["ok" => true]);
