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

/** Termine la requête sur une réponse JSON. */
function repondre(int $code, array $corps): never
{
    http_response_code($code);
    echo json_encode($corps, JSON_UNESCAPED_UNICODE);
    exit;
}

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

/* Reply-To sur le client : répondre depuis sa boîte suffit à ouvrir l'échange. */
$entetes = [
    "From: " . entete("Maison Alliani") . " <" . EXPEDITEUR . ">",
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
$envoye = mail(DESTINATAIRE, $sujet, $corps, implode("\r\n", $entetes), "-f" . EXPEDITEUR);

if (!$envoye) {
    repondre(500, ["ok" => false, "error" => "Le serveur n'a pas pu envoyer le message."]);
}

repondre(200, ["ok" => true]);
