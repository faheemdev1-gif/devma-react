export default function LanguageSwitch({ language }) {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  return <div className="language-switch" role="group" aria-label={language === 'it' ? 'Lingua del sito' : 'Website language'}>
    <a href={'/it/' + hash} lang="it" hrefLang="it" aria-label="Leggi in italiano" aria-current={language === 'it' ? 'page' : undefined}>IT</a>
    <a href={'/en/' + hash} lang="en" hrefLang="en" aria-label="Read in English" aria-current={language === 'en' ? 'page' : undefined}>EN</a>
  </div>;
}
