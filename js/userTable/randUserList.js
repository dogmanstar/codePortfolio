export { userArr };
import { boyNames } from "./userInfo/commonBoyNames200.js";
import { girlNames } from "./userInfo/commonGirlNames200.js";
import { lastNames } from "./userInfo/commonLastNames.js";
import { address } from "./userInfo/address.js";
import { customerNotes } from "./userInfo/customerNotes.js";

let formatedAddress = address.map((obj) => {
    let arr = obj.address.split('\n');
    let street = arr[0];
    arr = arr[1].split(', ');
    let city = arr[0];
    arr = arr[1].split(' ');
    let state = arr[0];
    arr = arr[1].split('-');
    let zip = arr[0];
    let pluss4 = arr[1] ? arr[1] : undefined;
    let formated = {
        'street': street,
        'city': city,
        'state': state,
        'zip': zip,
        'pluss4': pluss4
    }
    return formated;
});

class UserObj {
    constructor(id, firstName, lastName, addressObj, gender, note) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = this.makePhone();
        this.email = this.makeEmail();
        this.addressObj = addressObj;
        this.gender = gender;
        this.customerType = ["Free", "Paid", "Pro"][Math.floor(Math.random() * 3)];
        this.yearsCustomer = Math.floor(Math.random() * Math.random() * 15) + 1;
        this.purchaseList = this.makePurchaseList();
        this.orders = this.purchaseList.length;
        this.favItem = this.findFavoriteItem();
        this.avePurchaseCost = this.findAveragePurchaseCost();
        this.note = note;
    }

    static priceList = {"apple": 2, "banana": 3, "orange": 2.5, "bread": 6.5, "butter": 4, "sugar": 1.5, "milk": 2.75, "eggs": 5, "flour": 2.75, "tomato": 3.75, "lettuce": 1.75, "carrot": 2.25, "onion": 2, "garlic": 1.25, "chips": 3.75, "salt": .75, "pepper": .75, "cheese": 4.75, "pasta": 4.75, "pasta sauce": 4.75};

    get addressStr() {
        let a = this.addressObj;
        let str = `${a.street}\n${a.city}, ${a.state} ${a.zip}`;
        if (a.pluss4) {
            str = `${str}-${a.pluss4}`;
        }
        return str;
    }

    makePhone() {
        let three = (Math.floor(Math.random() * 600) + 200).toString();
        let four = Math.floor(Math.random() * 10000).toString();
        while (four.length < 4) {
            let s = "0";
            four = s.concat(four);
        }
        let phone = `(555) ${three}-${four}`;
        return phone;
    }

    makeEmail() {
        let email = `${this.firstName}_${this.lastName}@notreal.com`;
        return email;
    }

    makePurchaseList() {
        let numPurchases = Math.floor(Math.random() * Math.random() * 40) + 1;
        const items = Object.keys(UserObj.priceList);
        let purchases = [];
        for (let i = 0; i < numPurchases; i++) {
            let order = {};
            let numItems = Math.floor(Math.random() * 20) + 1;
            for (let j = 0; j < numItems; j++) {
                let selected = items[Math.floor(Math.random() * items.length)];
                if (order[selected] === undefined) {
                    order[selected] = 1;
                } else {
                    order[selected] += 1;
                }
            }
            purchases.push(order);
        }
        return purchases;
    }

    findAveragePurchaseCost() {
        let orderTotals = [];
        this.purchaseList.forEach((order) => {
            let keyVal = Object.entries(order);
            let orderCost = 0;
            for (let i = 0; i < keyVal.length; i++) {
                let itemCost = UserObj.priceList[keyVal[i][0]] * keyVal[i][1];
                orderCost += itemCost;
            }
            order.__total = orderCost;
            orderTotals.push(orderCost);
        });
        let grandTotal = orderTotals.reduce((acc, val) => {
            return acc + val;
        }, 0);
        let average = grandTotal / orderTotals.length;
        return average;
    }

    findFavoriteItem() {
        let list = {};
        this.purchaseList.forEach((obj) => {
            let items = Object.entries(obj);
            for (let i = 0; i < items.length; i++) {
                if (list[items[i][0]]) {
                    list[items[i][0]] += items[i][1];
                } else {
                    list[items[i][0]] = items[i][1];
                }
            }
        });
        let listEntries = Object.entries(list);
        listEntries.sort((a, b) => b[1] - a[1]);
        return listEntries[0][0];
    }
}

function createUsers() {
    let shortLast = [];
    for (let i = 0; i < 55; i++) {
        let short = lastNames[Math.floor(Math.random() * lastNames.length)];
        shortLast.push(short);
    }
    let userArr = [];
    for (let i = 0; i < 300; i++) {
        let mf = Math.random();
        let first = undefined;
        let gender = undefined;
        if (mf < .5) {
            first = boyNames[Math.floor(Math.random() * boyNames.length)];
            gender = "M";
        } else {
            first = girlNames[Math.floor(Math.random() * girlNames.length)];
            gender = "F";
        }
        let last = shortLast[Math.floor(Math.random() * shortLast.length)];
        let addObj = formatedAddress[Math.floor(Math.random() * formatedAddress.length)];
        let note = customerNotes[Math.floor(Math.random() * customerNotes.length)];
        let user = new UserObj(i, first,last, addObj, gender, note);
        userArr.push(user);
    }
    return userArr;
}
const userArr = createUsers();