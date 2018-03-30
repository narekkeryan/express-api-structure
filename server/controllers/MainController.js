class MainController {
    mainPage (req, res) {
        return res.render('home');
    }
}

var mainController = new MainController();

module.exports = mainController;