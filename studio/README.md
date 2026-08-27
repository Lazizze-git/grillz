# Espace d'édition — Maison Alliani

Le contenu du site se modifie ici, sans toucher au code :

**https://maisonalliani.sanity.studio**

Toute modification **publiée** apparaît sur le site en quelques secondes, après
un rafraîchissement de la page. Tant qu'une modification n'est pas publiée,
elle reste un brouillon visible seulement dans l'espace d'édition.

## Ce qui est modifiable

Chaque page du site a son entrée dans le menu de gauche. Les rubriques du
Studio suivent l'ordre des sections telles qu'on les voit en ligne.

| Rubrique | Contenu |
| --- | --- |
| **Page d'accueil** | La grande photo et son titre, les trois repères, les boutons, l'en-tête du catalogue, les quatre étapes du protocole, la photo de respiration, les deux voies, le tableau des matières, la section atelier, l'entretien et les garanties, la FAQ, l'appel à l'action final. |
| **Page Savoir-faire** | Le haut de page, l'origine et le portrait de la technicienne-dentiste, la transmission, la citation, la section « Aujourd'hui », les trois piliers, les matières et les quatre gestes. |
| **Page Processus** | Le haut de page, les quatre grandes étapes illustrées, le tableau des informations pratiques et l'encart final. |
| **Page Galerie** | Le haut de page, les libellés des six filtres et le mot du compteur. Les pièces affichées viennent de « Créations ». |
| **Page Contact** | Le haut de page, les titres des cinq étapes du formulaire, les intitulés des champs, les choix proposés, les bornes du budget, la confirmation d'envoi et la colonne de droite. |
| **Créations (galerie)** | Les pièces : nom, référence, photos, catégories, matériau, nombre de dents, délai, style. Chaque photo devient une vue dans la galerie ; la première sert de vignette sur l'accueil. |
| **Réglages du site** | E-mail, téléphone, adresse, Instagram, le statut « Carnet ouvert », les mentions du menu et tout le pied de page — repris sur toutes les pages. |

### Le référencement, page par page

Chaque page a une rubrique **Référencement** : le titre de l'onglet (environ
60 caractères) et la description affichée sous le titre dans Google (environ
155 caractères). Laissés vides, les textes inscrits dans la page sont conservés.

## Ajouter une création

1. **Créations (galerie)** → *Create*.
2. Renseigner le nom, la référence (ex. `MA-10`) et déposer les photos.
3. Pour chaque photo : écrire la description (elle est lue par Google et par les
   lecteurs d'écran) et, s'il s'agit d'un autre angle, un nom de vue
   (« Profil », « Revers »).
4. Cocher les catégories : elles alimentent les filtres de la galerie.
5. *Publish*.

Le cadrage des photos se règle en cliquant sur l'image, puis sur l'outil de
recadrage : le point choisi reste visible quelle que soit la taille d'écran.

Le compteur « 09 modèles référencés » de l'accueil se met à jour tout seul.

## Ajouter ou retirer une entrée dans une liste

Les listes — étapes, questions fréquentes, lignes de caractéristiques,
matières, points d'entretien — s'allongent et se raccourcissent librement :
la page suit. Les numéros (`01//`, `02//`…) sont recalculés automatiquement.

Deux exceptions, parce que chaque entrée porte son propre dessin dans la page :

- **Trois piliers** (Savoir-faire) : exactement trois, chacun gardant son
  pictogramme.
- **Choix du formulaire** (Contact) : le nombre est fixe et la valeur
  technique envoyée à l'atelier reste inscrite dans la page. Seuls les
  libellés se modifient — le formulaire ne peut donc pas se casser depuis
  le Studio.

## Titres en deux teintes

Beaucoup de titres sont écrits en deux morceaux : le **Titre** s'affiche en
blanc, la **Suite du titre** en gris. Sur l'accueil, « Quatre gestes. » puis
« Un seul protocole. ». Laisser la suite vide donne un titre d'une seule teinte.

## Traductions

Le site est bilingue. Les textes d'origine sont déjà traduits ; pour un texte
**modifié ou ajouté**, remplir aussi le bloc replié « Traduction anglaise ».
Sans traduction, la version anglaise affiche le texte français.

## Quand une modification apparaît-elle sur le site ?

Une modification **publiée** part sur le site en une minute environ : la
publication déclenche le recalcul des pages, qui sont renvoyées sur le
serveur avec le nouveau contenu déjà inscrit dedans.

En attendant ce recalcul, le site va lui-même chercher le contenu publié à
chaque ouverture de page : la modification est donc visible tout de suite,
même avant que les pages aient été renvoyées.

Un brouillon non publié n'apparaît nulle part, sauf pour vous dans l'espace
d'édition.

## Si le CMS est indisponible

Le site continue de fonctionner : les pages livrées contiennent déjà tout le
contenu. Rien ne casse, rien ne disparaît.

---

## Notes techniques

- Projet Sanity `eh6tu5mk`, dataset `production` (public en lecture seule).
- Les pages livrées au visiteur sont **calculées à la publication**
  (`studio/scripts/prerender.mjs`) : le contenu et les adresses des photos y
  sont déjà inscrits. Aucune photo écrite en dur ne subsiste dans le HTML
  livré, donc aucune ancienne photo n'apparaît le temps d'un chargement, et
  les moteurs de recherche lisent le vrai contenu.
- Le calcul n'écrit pas une seconde fois la logique de liaison : il exécute
  les fichiers `js/cms-*.js` du site dans un DOM simulé (`jsdom`). Ce qui est
  calculé et ce qui s'exécute chez le visiteur ne peuvent pas diverger.
- Le site interroge malgré tout l'API depuis le navigateur, sans clé secrète :
  une modification publiée est visible avant même que les pages aient été
  recalculées.
- `js/cms-client.js` contient le moteur de liaison. Les pages portent des
  attributs qui désignent un champ par son chemin :

  | Attribut | Effet |
  | --- | --- |
  | `data-cms="chemin"` | remplace le texte de l'élément |
  | `data-cms-lead="chemin"` | remplace le début du texte, en gardant les enfants (titres en deux teintes) |
  | `data-cms-img="chemin"` | remplace la photo ; `data-cms-w` / `data-cms-h` donnent les dimensions demandées |
  | `data-cms-attr="href:chemin"` | remplace un attribut ; plusieurs paires séparées par une virgule |
  | `data-cms-repeat="chemin"` | répète le premier enfant du conteneur pour chaque entrée de la liste |
  | `data-cms-num="//"` | numérote l'entrée courante d'une répétition : `01//` |
  | `data-cms-delay="2"` | échelonne l'apparition des entrées répétées |

  Un chemin peut proposer des replis : `a.full|a.label` retient la première
  valeur renseignée. Rien n'est écrasé tant qu'une valeur n'arrive pas : le
  texte inscrit dans la page reste la version de secours.

- Origines autorisées (CORS) : `localhost:5502`, `127.0.0.1:5502`,
  `maison-alliani.com`, `www.maison-alliani.com`. **À déclarer avant la mise
  en ligne** : `npx sanity cors add https://maison-alliani.com --no-credentials`
  (puis idem pour `https://www.maison-alliani.com`).

### Commandes

```bash
npm install            # une seule fois
npm run dev            # espace d'édition en local : http://localhost:3333
npm run deploy         # met en ligne https://maisonalliani.sanity.studio

npm run prerender      # calcule les pages dans dist/, avec le contenu publié

node scripts/build-seed.mjs                                  # régénère le contenu de départ
npx sanity dataset import scripts/seed.ndjson production --replace
```

> L'import écrase les documents portant les mêmes identifiants : ne l'utiliser
> que pour repartir du contenu d'origine.
