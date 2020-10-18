import bayes from 'bayes';

class ArticleRater {
  constructor() {
    this.language = 'en';
    this.loadClassifier();
  }

  setLanguage(language) {
    this.language = language;
    this.loadClassifier();
  }

  get storageKey() {
    return `${this.language}_classifier`;
  }

  loadClassifier() {
    if (localStorage[this.storageKey]) {
      this.classifier = bayes.fromJson(localStorage[this.storageKey]);
    }
    else {
      this.classifier = bayes();
    }
  }

  saveClassifier() {
    localStorage[this.storageKey] = this.classifier.toJson();
  }

  add(text, category) {
    this.classifier.learn(text, category);
    this.saveClassifier();
  }

  classify(text) {
    return this.classifier.categorize(text);
  }
}

const instance = new ArticleRater();

export default instance;
