# Filtre anti-spam du formulaire de contact

Le formulaire de `contact.html` poste sur `envoi.php`, qui inclut
`spam-filter.php`. Un robot n'affiche jamais la page : il envoie sa requête
directement sur le script. Un champ piège seul ne suffit donc pas — il vit
dans le HTML, que le robot ne charge pas.

## Les cinq couches

| # | Couche | Ce qu'elle attrape |
|---|--------|--------------------|
| 1 | Deux champs pièges (`site`, `website`) | Les robots qui remplissent tout |
| 2 | Jeton de page | Le POST direct, et le formulaire rempli en moins de 3 s |
| 3 | Score de contenu | Liens, raccourcisseurs, formules, alphabets, provenance |
| 4 | Limite de fréquence par IP | 3 envois par heure, 10 par 24 h |
| 5 | Anti-doublon | Le même message renvoyé dans les 24 h |

**L'anti-doublon est vérifié avant la limite de fréquence.** Un visiteur qui
reclique sur un envoi qui lui semble lent renvoie le même message : si la
fréquence passait d'abord, chaque renvoi identique lui coûterait un envoi de
son quota horaire, et son message suivant — bien réel — serait écarté en
silence. `tests/antispam.php` verrouille ce scénario.

Le seuil de blocage est de **7 points** (`ANTISPAM_SEUIL`). Les formules de
spam plafonnent à 6 et la vitesse de remplissage vaut 4 : ni l'une ni l'autre
ne bloque seule, il faut toujours un second signal. Un prospect qui donne
l'adresse de son site actuel obtient 3 points et passe.

**Un message écarté reçoit exactement la même réponse qu'un message accepté**
(`200 {"ok":true}`). Le robot ne peut rien déduire de son échec.

## Le jeton de page

`js/form.js` écrit à l'ouverture, dans un champ caché, un horodatage suivi
d'une somme de contrôle ; `spam-filter.php` la recalcule à l'identique
(hachage 31 sur 32 bits, rendu en base 36). Les deux boucles doivent rester
strictement équivalentes — le sel est `antispam-v1` des deux côtés.

    node tests/jeton.mjs 1700000000
    php  tests/jeton.php 1700000000     # doit rendre la même chaîne

L'absence de jeton coûte 3 points, elle ne bloque pas : **l'envoi sans
JavaScript reste fonctionnel**.

## Dossier de travail

`.antispam/` à la racine du site : `journal.log` (toutes les décisions),
`frequence.json`, `empreintes.json`. Il se crée tout seul au premier envoi et
pose son propre `.htaccess` de refus — le déploiement FTP ne l'emporte donc
pas. Le `.htaccess` de la racine refuse en plus l'accès à `spam-filter.php` et
à `.antispam/`.

**Si le dossier n'est pas inscriptible**, la limite de fréquence et
l'anti-doublon se désactivent d'eux-mêmes plutôt que de bloquer des envois
légitimes. Le score et les pièges, eux, continuent de fonctionner.

Chaque e-mail qui passe porte en pied son score et l'IP de l'envoyeur : de
quoi relire une décision limite sans ouvrir le journal.

## Cloudflare Turnstile — prévu, dormant

La couche est écrite mais inerte. Elle ne s'active que si une clé secrète est
posée côté serveur, par variable d'environnement `TURNSTILE_SECRET` ou par une
constante du même nom définie avant l'inclusion de `spam-filter.php`. Il faut
alors ajouter le widget dans `contact.html` (champ `cf-turnstile-response`).
Si Cloudflare est injoignable, le filtre laisse passer : une panne chez un
tiers ne doit pas fermer le formulaire.

## Vérifier

    php tests/antispam.php     # tableau des scores sur les cas réels

Le tableau doit finir sur « Tous les cas sont conformes ». **Si un seul cas
légitime est bloqué, c'est le score qu'il faut ajuster** : un faux positif
coûte un client, un faux négatif coûte une seconde de suppression.

## Relire les faux positifs

    tail -50 .antispam/journal.log

Une ligne `ECARTE` dont les raisons ne tiennent qu'à `liens:1` et
`message-court` mérite un coup d'œil : c'est le voisinage du seuil.
