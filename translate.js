import translate from "google-translate-api-x";

export async function translateText(sourceText, sourceLang, destLang) {
  const res = await translate(sourceText, { from: sourceLang, to: destLang });
  return res.text;
}

export async function retranslateText(sourceText, sourceLang, destLang) {
  let res = await translate(sourceText, { from: sourceLang, to: destLang });
  const translated = res.text;
  res = await translate(translated, { from: destLang, to: sourceLang });
  return res.text;
}
