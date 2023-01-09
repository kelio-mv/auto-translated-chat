import fetch from "node-fetch";

export async function translate(text, sourceLang, destLang) {
  const endpoint = "https://translate.googleapis.com/translate_a/single";
  const response = await fetch(
    `${endpoint}?client=gtx&sl=${sourceLang}&tl=${destLang}&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await response.json();
  return data[0][0][0];
}

export async function retranslate(text, sourceLang, destLang) {
  const translation = await translate(text, sourceLang, destLang);
  return translate(translation, destLang, sourceLang);
}
