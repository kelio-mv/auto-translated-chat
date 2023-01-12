import fetch from "node-fetch";

async function _translate(text, sourceLang, destLang) {
  const endpoint = "http://translate.google.com/translate_a/single";
  const response = await fetch(
    `${endpoint}?client=gtx&sl=${sourceLang}&tl=${destLang}&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await response.json();
  return data[0][0][0];
}

export async function translate(text, sourceLang, destLang) {
  const texts = text
    .split(".")
    .map((t) => t.trim())
    .filter((t) => t !== "");

  const translations = await Promise.all(texts.map((t) => _translate(t, sourceLang, destLang)));
  return translations.map((t) => t.trim()).join(". ");
}

export async function retranslate(text, sourceLang, destLang) {
  const translation = await translate(text, sourceLang, destLang);
  return translate(translation, destLang, sourceLang);
}
