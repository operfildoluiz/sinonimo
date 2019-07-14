const fetch = require("node-fetch"),
  slugify = require("slugify"),
  cheerio = require("cheerio"),
  iconv = require("iconv-lite");

module.exports = async function sinonimo(term) {
  const searchTerm = slugify(term, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });

  let contentPage = await fetchSinominoPage(searchTerm);
  let synonymsArray = await extractSynonyms(contentPage);

  return synonymsArray;

  async function fetchSinominoPage(searchTerm) {
    return new Promise((resolve, reject) => {
      fetch(`https://www.sinonimos.com.br/${searchTerm}`)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer =>
          iconv.decode(Buffer.from(arrayBuffer), "iso-8859-1").toString()
        )
        .then(body => resolve(body))
        .catch(err => reject(err));
    });
  }

  async function extractSynonyms(htmlContent) {
    return new Promise((resolve, reject) => {
      try {
        const synonyms = [];
        const $ = cheerio.load(htmlContent);
        $(".sinonimo").each(function(i, e) {
          synonyms.push($(this).text());
        });
        resolve(synonyms);
      } catch (err) {
        reject(err);
      }
    });
  }
};
