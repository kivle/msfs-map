import bayes from 'bayes';

class ArticleRater {
  constructor() {
    this.loadClassifier();
  }

  loadClassifier() {
    if (localStorage['classifier']) {
      this.classifier = bayes.fromJson(localStorage['classifier']);
    }
    else {
      this.classifier = bayes();
    }
  }

  saveClassifier() {
    localStorage['classifier'] = this.classifier.toJson();
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
