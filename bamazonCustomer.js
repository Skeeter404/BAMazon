var mysql = require("mysql");

var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "root",
    database: "Bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;

    displayProducts();
    setTimeout(shop, 3000);
});

function displayProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("----------------------------");
        console.log("ID | Product | Price");
        console.log("----------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + "$" + res[i].price);
            console.log("----------------------------");
        }
    })
};

function shop() {
    connection.query("SELECT * FROM products", function (err, res) {

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].item_id.toString());
                        }
                        return choiceArray;
                    },
                    message: "Based on the ID of the item, which product would you like to purchse?"
                },
                {
                    name: "quantity",
                    type: "list",
                    choices: ["1", "2", "3", "4", "5"],
                    message: "How many would you like to purchase?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id === parseInt(answer.choice)) {
                        chosenItem = res[i];
                    }
                }

                var totalPaid = chosenItem.price * answer.quantity;

                if(chosenItem.stock_quantity >= parseInt(answer.quantity)){
                    connection.query(
                        "Update products Set ? Where ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - answer.quantity
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function(error){
                            if (error) throw err;
                            console.log("Purchase successful! Your purchase came to a total of $" + totalPaid);
                            setTimeout(displayProducts, 3000);
                            setTimeout(shop, 5000);
                        }
                    )
                }
                else{
                    console.log("We don't have enough of that item to fulfill your order. Please try again!");
                    setTimeout(displayProducts, 3000);
                    setTimeout(shop, 5000);
                }
            });
    });
};