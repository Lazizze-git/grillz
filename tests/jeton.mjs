/* Reproduit exactement la boucle de js/form.js, pour un horodatage donné. */
const SALT = "antispam-v1";
const seconds = Number(process.argv[2]);
const source = SALT + ":" + seconds;
let hash = 0;
for (let i = 0; i < source.length; i++) {
  hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
}
console.log(seconds + "." + hash.toString(36));
