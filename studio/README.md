# Espace d'édition — Maison Alliani

Le contenu du site se modifie ici, sans toucher au code :

**https://maison-alliani.sanity.studio**

Toute modification **publiée** apparaît sur le site en quelques secondes, après
un rafraîchissement de la page. Tant qu'une modification n'est pas publiée,
elle reste un brouillon visible seulement dans l'espace d'édition.

## Ce qui est modifiable

| Rubrique | Contenu |
| --- | --- |
| **Page d'accueil** | La grande photo du haut, sa légende, le titre en deux lignes, le paragraphe d'introduction et les trois repères (prix, délai, envoi). |
| **Créations (galerie)** | Les pièces : nom, référence, photos, catégories, matériau, nombre de dents, délai, style. Chaque photo devient une vue dans la galerie ; la première sert de vignette sur l'accueil. |
| **Page Savoir-faire** | La photo d'en-tête, le portrait de la technicienne-dentiste, sa légende, ses paragraphes et sa phrase mise en avant. Les quatre paragraphes se placent à quatre endroits distincts de la page (origine, transmission, puis deux colonnes) : garder cet ordre. |
| **Réglages du site** | E-mail, téléphone, adresse, Instagram et le statut « Carnet ouvert » — repris dans le menu et le pied de page de toutes les pages. |

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

## Traductions

Le site est bilingue. Les textes d'origine sont déjà traduits ; pour un texte
**modifié ou ajouté**, remplir aussi le bloc replié « Traduction anglaise ».
Sans traduction, la version anglaise affiche le texte français.

## Si le CMS est indisponible

Le site continue de fonctionner : chaque page contient une version de secours
du contenu, écrite dans le code. Rien ne casse, rien ne disparaît.

---

## Notes techniques

- Projet Sanity `64jkc7yr`, dataset `production` (public en lecture seule).
- Le site interroge l'API depuis le navigateur, sans clé secrète, et
  reconstruit galerie, catalogue et portraits avant l'initialisation des
  modules (`js/cms-client.js`, `js/cms-gallery.js`, `js/cms-content.js`).
- Origines autorisées (CORS) : `localhost:5502`, `127.0.0.1:5502`,
  `maison-alliani.com`, `www.maison-alliani.com`. **À déclarer avant la mise
  en ligne** : `npx sanity cors add https://maison-alliani.com --no-credentials`
  (puis idem pour `https://www.maison-alliani.com`).

### Commandes

```bash
npm install            # une seule fois
npm run dev            # espace d'édition en local : http://localhost:3333
npm run deploy         # met en ligne https://maison-alliani.sanity.studio

node scripts/build-seed.mjs                                  # régénère le contenu de départ
npx sanity dataset import scripts/seed.ndjson production --replace
```

> L'import écrase les documents portant les mêmes identifiants : ne l'utiliser
> que pour repartir du contenu d'origine.
