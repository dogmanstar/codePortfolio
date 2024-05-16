export { TableRender };


const COL_ORDER_CONST = [ // Sets shown props and default order of columns
    "id",
    "firstName",
    "lastName",
    "phone",
    "email",
    "addressStr",
    "yearsCustomer",
    "orders",
    "avePurchaseCost",
    // "favItem",
    "purchaseList",
    "note"
];
const COL_TITLE_KEYS_CONST = { // List to map props to shown column title
    "id": "ID",
    "firstName": "First Name",
    "lastName": "Last Name",
    "phone": "Phone",
    "email": "Email",
    "addressStr": "Addr.",
    "yearsCustomer": "Cust. for",
    "orders": "Total Orders",
    "avePurchaseCost": "Avg. Purch.",
    // "favItem": "Fav. Item",
    "purchaseList": "Purch. List",
    "note": "Notes"
};

const COL_ABS_MIN = 50; // Absolute minimum width of columns

class TableRender {
    constructor() {
        this.dataArrConst = undefined;
        this.dataArr = undefined;
        this.page = 1;
        this.perPage = 15;

        this.colOrder = structuredClone(COL_ORDER_CONST);
        this.colTitleKeys = COL_TITLE_KEYS_CONST;
        this.titleMinWidth = {};
        this.dataMinWidth = {};
        this.colSizeObj = {};
        this.contactSettings = {"phone": "icon", "email": "icon", "addressStr": "icon"};
        this.filters = [];
        
        this.tableDiv = document.querySelector('#dataTable');
        this.tableDiv.addEventListener('click', this.handleClick.bind(this));
        this.perPageSelect = document.querySelector('#perPageSelect');
        this.perPageSelect.addEventListener('change', this.handlePerPageChange.bind(this));

        window.addEventListener('resize', this.handlePageResize.bind(this));
    }
    
    get pageMax() {
        return Math.ceil(this.dataArr.length / this.perPage);
    }

    // Event handlers------------------------------

    handleClick(event) {
        let id = event.target.id;
        console.log(id);
        if (id) {
            switch (true) {
                case id.startsWith("th"): {
                    console.log(`you have clicked the TH`);
                    break;
                }
                case id.startsWith("purchaseList"): {
                    console.log(`I would open purchaseList`);
                    break;
                }
                case id.startsWith("note"): {
                    console.log(`I would open note`);
                    break;
                }
                case id.startsWith("page"): {
                    this.handlePageChange(id);
                    break;
                }
            }
        } else {
            console.log("clicked", event.target.tagName);
        }
    }

    handlePageChange(id) {
        let split = id.split('_');
        let action = split[split.length -1];
        switch (action) {
            case "first": {
                if (this.page === 1) return;
                this.page = 1;
                break;
            }
            case "left": {
                if (this.page === 1) return;
                this.page = this.page - 1;
                break;
            }
            case "right": {
                if (this.page === this.pageMax) return;
                this.page = this.page + 1;
                break;
            }
            case "max": {
                if (this.page === this.pageMax) return;
                this.page = this.pageMax;
                break;
            }
            default: {
                let num = parseInt(action);
                if (this.page === num) return;
                this.page = num;
                break;
            }
        }
        this.renderTable();
    }

    handlePerPageChange(event) {
        let num = Number.parseInt(event.target.value);
        this.perPage = num;
        this.calcColSizes();
        this.renderTable();
    }

    handlePageResize() {
        this.calcColSizes();
        this.renderTable();
    }
    
    // Takes in a new data set, expects an array of objects
    // Finds min size of data for each column
    storeNewDataArr(data) {
        this.dataArrConst = data;
        this.dataArr = this.dataArrConst;
        this.findColMinTitlePxLengths();
        this.findDataMinWidth();
        this.calcColSizes();
        this.renderTable();
    }
    
    // Calculates column width dependent on width of table
    calcColSizes() {
        let fixedSizeCol = this.makeListOfFixedSize();
        let variableSizeCol = this.makeListOfVariableSize(fixedSizeCol).sort((a,b) => {
            return a[1] - b[1];
        });

        let availablePx = this.calcTableWidth();
        
        this.colSizeObj = {};
        fixedSizeCol.forEach((prop) => {
            this.colSizeObj[prop] = COL_ABS_MIN;
            availablePx -= COL_ABS_MIN;
        });

        let totalVarMin = variableSizeCol.reduce((total, item) => {
            return total + item[1];
        }, 0);

        if (totalVarMin < availablePx) {
            let addToEach = Math.floor((availablePx - totalVarMin) / variableSizeCol.length);
            variableSizeCol.forEach((item) => {
                this.colSizeObj[item[0]] = item[1] + addToEach;
                availablePx -= (item[1] + addToEach);
            });
            variableSizeCol.forEach((item) => {
                if (availablePx > 0) {
                    this.colSizeObj[item[0]] += 1;
                    availablePx -= 1;
                }
            });
        }
        this.colOrder.forEach((prop) => {
            let percent = Number.parseFloat((this.colSizeObj[prop] / this.calcTableWidth()) * 100).toFixed(3) + "%";
            this.colSizeObj[prop] = percent;
        })
    }

    // Finds fixed size columns and columns set to "icon" returns them as array
    makeListOfFixedSize() {
        let fixedSizeCol = ["purchaseList", "note"];
        this.colOrder.forEach((prop) => {
            if (this.contactSettings[prop] && this.contactSettings[prop] === "icon") {
                fixedSizeCol.push(prop);
            }
        });
        return fixedSizeCol;
    }

    // Makes 2d array of variable size columns and their min size, format: [col, min]
    makeListOfVariableSize(fixed) {
        let variableSizeCol = this.colOrder.filter((col) => {
            if (!fixed.includes(col)) {
                return col;
            }
        });
        let varSizeWithMins = variableSizeCol.map((col) => {
            let min = COL_ABS_MIN;
            if (this.titleMinWidth[col] > min) min = this.titleMinWidth[col];
            if (this.dataMinWidth[col] > min) min = this.dataMinWidth[col];
            return [col, min];
        });
        return varSizeWithMins;
    }

    // Finds the availalbe width for table
    calcTableWidth() {
        let tWidth = this.tableDiv.clientWidth;
        let computedStyles = window.getComputedStyle(this.tableDiv);
        const paddingLeft = parseFloat(computedStyles.paddingLeft);
        const paddingRight = parseFloat(computedStyles.paddingRight);
        tWidth -= (paddingLeft + paddingRight);
        return tWidth;
    }

    // Finds min width of col Title splits on " " and finds longest word.
    // Sets this.titleMinWidth obj
    findColMinTitlePxLengths() {
        let ruler = document.querySelector('#textRuler');
        let titleMin = {};
        COL_ORDER_CONST.forEach((prop) => {
            let words = COL_TITLE_KEYS_CONST[prop].split(' ');
            let max = 0;
            words.forEach((word) => {
                ruler.innerText = word;
                let pxLong = ruler.offsetWidth + 8;
                if (pxLong > max) max = pxLong;
            });
            titleMin[prop] = max;
        });
        this.titleMinWidth = titleMin;
    }

    // Finds data min widths by prop. Sets this.dataMinWidth obj
    findDataMinWidth() {
        let ruler = document.querySelector('#textRuler');
        let minLeng = {};
        COL_ORDER_CONST.forEach((prop) => {
            let max = 0;
            for (let i = 0; i < this.dataArr.length; i++) {
                switch (prop) {
                    case "id":
                    case "firstName":
                    case "lastName":
                    case "orders": {
                        ruler.innerText = this.dataArr[i][prop].toString();
                        let pxLong = ruler.offsetWidth + 8;
                        if (pxLong > max) max = pxLong;
                        break;
                    }
                    case "phone": {
                        let peices = this.dataArrConst[i][prop].split('-');
                        peices[0] += "-";
                        peices.forEach((peice) => {
                            ruler.innerText = peice;
                            let pxLong = ruler.offsetWidth + 8;
                            if (pxLong > max) max = pxLong;
                        });
                        break;
                    }
                    case "email": {
                        let peices = this.dataArrConst[i][prop].split('@');
                        peices[1] = "@" + peices[1];
                        peices.forEach((peice) => {
                            ruler.innerText = peice;
                            let pxLong = ruler.offsetWidth + 8;
                            if (pxLong > max) max = pxLong;
                        });
                        break;
                    }
                    case "addressStr": {
                        let peices = this.dataArrConst[i][prop].split('\n');
                        peices.forEach((peice) => {
                            ruler.innerText = peice;
                            let pxLong = ruler.offsetWidth + 8;
                            if (pxLong > max) max = pxLong;
                        });
                        break;
                    }
                    case "yearsCustomer": {
                        let str = this.dataArrConst[i][prop].toString() + "yrs.";
                        ruler.innerText = str;
                        let pxLong = ruler.offsetWidth;
                        if (pxLong > max) max = pxLong;
                        break;
                    }
                    case "avePurchaseCost": {
                        let str = this.dataArrConst[i][prop].toLocaleString(
                            "en-US", 
                            { style: "currency", currency: "USD" }
                        );
                        ruler.innerText = str;
                        let pxLong = ruler.offsetWidth;
                        if (pxLong > max) max = pxLong;
                        break;
                    }
                    case "purchaseList":
                    case "note": {
                        max = 42;
                    }
                }
            }
            minLeng[prop] = max + 8;
        });
        this.dataMinWidth = minLeng;
    }

    // Clears and rerenders the table
    renderTable() {
        while (this.tableDiv.firstChild) {
            this.tableDiv.removeChild(this.tableDiv.firstChild);
        }
        let table = document.createElement('table');
        let head = table.createTHead();
        this.renderTableHead(head);
        let body = table.createTBody();
        let foot = document.createElement('div');
        this.renderTableFoot(foot);
        let index = (this.page - 1) * this.perPage;
        let displayPage = this.dataArr.slice(index, index + this.perPage);
        
        let rowsArr = displayPage.map((obj) => {
            let row = this.renderRow(obj);
            return row;
        });
        rowsArr.forEach((row) => {
            body.appendChild(row);
        });
        this.tableDiv.appendChild(table);
        this.tableDiv.appendChild(foot);

        // Set cols here on table heads after appending table to DOM
        
    }

    // Creates a row element and fill it with data
    // Gives td elements an ID in the format: [prop]_[obj.id]
    renderRow(obj) {
        let row = document.createElement('tr');
        this.colOrder.forEach((prop) => {
            switch (prop) {
                case "id":
                case "orders": {
                    let cell = row.insertCell();
                    cell.innerText = obj[prop].toString();
                    break;
                }
                case "firstName":
                case "lastName": {
                    let td = row.insertCell();
                    td.innerText = this.capitalizeFirstLetter(obj[prop]);
                    break;
                }
                case "phone": {
                    let phone = row.insertCell();
                    if (this.contactSettings[prop] === "text") {
                        phone.innerText = obj[prop].toString();
                    } else {
                        let image = document.createElement('img');
                        image.id = `${prop}_${obj.id}`;
                        image.src = './images/telephone.svg';
                        image.alt = 'Phone Number';
                        phone.appendChild(image);
                    }
                    break;
                }
                case "email": {
                    let email = row.insertCell();
                    if (this.contactSettings[prop] === "text") {
                        email.innerText = obj[prop].toString().replace(/@/g, '\n@');
                    } else {
                        let image = document.createElement('img');
                        image.id = `${prop}_${obj.id}`;
                        image.src = './images/envelope-at.svg';
                        image.alt = 'Email';
                        email.appendChild(image);
                    }
                    break;
                }
                case "addressStr": {
                    let adrObj = row.insertCell();
                    if (this.contactSettings[prop] === "text") {
                        let pre = document.createElement('pre');
                        let text = document.createTextNode(obj[prop]);
                        pre.appendChild(text);
                        adrObj.appendChild(pre);
                    } else {
                        let image = document.createElement('img');
                        image.id = `${prop}_${obj.id}`;
                        image.src = './images/house.svg';
                        image.alt = 'Address';
                        adrObj.appendChild(image);
                    }
                    break;
                }
                case "yearsCustomer": {
                    let cell = row.insertCell();
                    cell.innerText = obj[prop].toString().concat(obj[prop] === 1 ? "yr." : "yrs.");
                    break;
                }
                case "avePurchaseCost": {
                    let avePurchCost = row.insertCell();
                    avePurchCost.innerText = obj[prop].toLocaleString("en-US", { style: "currency", currency: "USD" });
                    break;
                }
                case "purchaseList": {
                    let purchList = row.insertCell();
                    let image = document.createElement('img');
                    image.id = `${prop}_${obj.id}`;
                    image.src = './images/truck.svg';
                    image.alt = 'Purchase list button';
                    purchList.appendChild(image);
                    break;
                }
                case "note": {
                    let note = row.insertCell();
                    let image = document.createElement('img');
                    image.id = `${prop}_${obj.id}`;
                    image.src = './images/clipboard.svg';
                    image.alt = 'Purchase list button';
                    note.appendChild(image);
                    break;
                }
            }
        });
        return row;
    }

    // Creates a tr element filled with th elements
    // Gives th elements an ID in the format: th_[prop]
    renderTableHead(head) {
        let row = head.insertRow();
        this.colOrder.forEach((prop) => {
            let th = document.createElement('th');
            th.id = `th_${prop}`;
            th.style.width = this.colSizeObj[prop];
            th.style.minWidth = '9%';
            let text = document.createTextNode(this.colTitleKeys[prop]);
            th.appendChild(text);
            row.appendChild(th);
        });
    }
    
    // Creates a div to act as table foot. Fills with clickable elements for pagination
    // Clickable elements have ID in the format: page_[num] or page_[action]
    renderTableFoot(foot) {
        foot.id = "tableFoot";
        
        let lDiv = document.createElement('div');
        foot.appendChild(lDiv);
        
        let first = document.createElement('img');
        first.id = "page_first";
        first.classList.add("footSVG");
        first.src = "images/caret-circle-double-left-bold-svgrepo-com.svg";
        first.alt = "Page First Arrow";
        first.title = "Page First";
        lDiv.appendChild(first);
        
        let left = document.createElement('img');
        left.id = "page_left";
        left.classList.add("footSVG");
        left.src = "images/caret-circle-left-bold-svgrepo-com.svg";
        left.alt = "Page Left Arrow";
        left.title = "Page Left";
        lDiv.appendChild(left);
        
        let pageNumsDiv = document.createElement('div');
        foot.appendChild(pageNumsDiv);
        
        let pageDiv = document.createElement('div');
        pageDiv.innerText = "Page:";
        pageNumsDiv.appendChild(pageDiv);
        
        for (let i = 1; i <= this.pageMax; i++) {
            let div = document.createElement('div');
            div.id = `page_${i}`;
            div.classList.add("footPageNum");
            div.innerText = i.toString();
            pageNumsDiv.appendChild(div);
        }
        
        let rDiv = document.createElement('div');
        foot.appendChild(rDiv);
        
        let right = document.createElement('img');
        right.id = "page_right";
        right.classList.add("footSVG")
        right.src = "images/caret-circle-right-bold-svgrepo-com.svg";
        right.alt = "Page Right Arrow";
        right.title = "Page Right";
        rDiv.appendChild(right);
        
        let last = document.createElement('img');
        last.id = "page_max";
        last.classList.add("footSVG");
        last.src = "images/caret-circle-double-right-bold-svgrepo-com.svg";
        last.alt = "Page Max Arrow";
        last.title = "Page Max";
        rDiv.appendChild(last);
    }

    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}