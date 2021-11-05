
//属性列
class PropertyColumn {
    name: string;

    constructor(name: string) {
        this.name = name
    }

    changeName(name: string) {
        this.name = name;
    }
}

// 单选列
class Select extends PropertyColumn {
    constructor(name: string) {
        super(name);
    }
}

// Url列
class UrlColumn extends Select {
    public data: Array<string>;
    public isEdit: Array<boolean>;
    public filter: textFilter;

    constructor(name: string) {
        super(name);
        this.data = [];
        this.isEdit = [];
        this.filter = new textFilter();
    }

    public addRow(seq?: number | string, text?: string) {
        if(typeof seq === "number") {
            this.data.splice(seq, 0, text ? text : "");
            this.isEdit.splice(seq, 0, !this.test(text ? text : ""));
            
        }
        else if(typeof seq === "string"){
            this.data.push(seq);
            this.isEdit.push(!this.test(seq));
        }
        else {
            this.data.push("");
            this.isEdit.push(true);
        }
    }

    public deleteRow(seq: number) {
        this.data.splice(seq, 1);
        this.isEdit.splice(seq, 1);
    }

    public editRow(seq: number) {
        this.isEdit[seq] = !this.test(this.data[seq]);
    }

    private test(url: string) {
        const strRegex = "^((https|http)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        // eslint-disable-next-line no-useless-escape
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        // eslint-disable-next-line no-useless-escape
        + "([0-9a-z_!~*'()-]+\.)*" // 域名 http://www.my400800.cn
        // eslint-disable-next-line no-useless-escape
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        const re = new RegExp(strRegex);
        return re.test(url);
    }

    groupResult(): Map<string, Array<number>> {
        const result = new Map<string, Array<number>>();
        result.set("空",[]);
        const data = this.filter.filterResult(this.data);
        data.forEach(rowIndex => {
            if (result.has(this.data[rowIndex])) {
                result.get(this.data[rowIndex]).push(rowIndex);
            }
            else if(this.data[rowIndex] === ""){
                result.get("空").push(rowIndex);
            }
            else {
                result.set(this.data[rowIndex], [rowIndex]);
            }
            
        })
        return result;
    }

}

// email列
class EmailColumn extends Select {
    public data: Array<string>
    public isEmail: Array<boolean>

    constructor(name: string) {
        super(name);
        this.data = [];
        this.isEmail = [];
    }

    public addRow(seq?: number | string, text?: string) {
        if(typeof seq === "number") {
            this.data.splice(seq, 0, text ? text : "");
            this.isEmail.splice(seq, 0, this.test(text ? text : ""));
        }
        else if(typeof seq === "string"){
            this.data.push(seq);
            this.isEmail.push(this.test(seq));
        }
        else {
            this.data.push("");
            this.isEmail.push(false);
        }
    }

    public deleteRow(seq: number) {
        if(seq) {
            this.data.splice(seq, 1);
            this.isEmail.splice(seq, 1);
        }
    }

    public editRow(seq: number) {
        this.isEmail[seq] = this.test(this.data[seq]);
    }

    private test(email: string) {
        // eslint-disable-next-line no-useless-escape
        const strRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        const re = new RegExp(strRegex);
        return re.test(email);
    }

}

class textFilter {
    public relation: string;// and|or
    public filters: Array<Array<string>>; //filters数组每一项代表一个筛选器，筛选器第一项代表筛选器类型，第二项代表筛选器数据

    public constructor() {
        this.relation = "and",
            this.filters = new Array<Array<string>>();
    }
    //筛选器编辑
    public addFilter(type?: string, text?: string) {
        if (type && text) {
            this.filters.push([type, text])
        }
        else {
            this.filters.push(["包含", ""])
        }
    }
    public deleteFilter(ref: number|string) {
        if (typeof ref == "number") { //ref为数组下标：根据数组下标删除
            this.filters.splice(ref, 1)
        } else { //ref为tag名称：根据标签名字删除
            // this.filters = this.filters.filter(value => value[1] !== ref)
            for (let i = 0; i < this.filters.length; i++) {
                if (this.filters[i][1] == ref) {
                    this.filters.splice(i, 1);
                }
            }
        }
    }
    public editFilter(seq: number, filter: string) {
        this.filters.splice(seq, 1, [this.filters[seq][0], filter])
    }

    //筛选器查找
    public andFilter(filterArray: Array<Array<number>>): Array<number> {
        let a = filterArray[0];
        filterArray.forEach(item => {
            a = a.filter(x => item.indexOf(x) !== -1);
        });
        return a;
    }
    public orFilter(filterArray: Array<Array<number>>): Array<number> {
        const a = new Set<number>()
        filterArray.forEach(item => {
            item.forEach(item => {
                a.add(item);
            })
        })
        return Array.from(a);
    }
    public filterResult(data: Array<string>): Array<number> {
        //无筛选器:直接按顺序返回原有数组
        const result = new Array<number>();
        if (this.filters.length == 0) {
            data.forEach((value, index, array) => {
                result.push(index)
            })
            return result;
        }
        //有筛选器:求每个筛选器对应的数组，然后进行or或and的合并
        const filterArray = new Array<Array<number>>();
        this.filters.forEach((filter, filterSeq) => {
            filterArray.push(new Array<number>());
            data.forEach((str, index) => {
                if ((str.indexOf(filter[1]) !== -1 && filter[0] === "包含") || (str.indexOf(filter[1]) === -1 && filter[0] === "不包含")) {
                    filterArray[filterSeq].push(index)
                }
            })
        })
        return this.relation == "and" ? this.andFilter(filterArray) : this.orFilter(filterArray)
    }
    
}

//多选列
class MultiSelect extends PropertyColumn {
    constructor(name: string) {
        super(name)
    }
}

//多选列
class MultiSelectColumn extends MultiSelect {

    span: Set<string>
    data: Array<Set<string>>

    constructor(name: string) {
        super(name)
        this.span = new Set<string>();
        this.data = new Array<Set<string>>();
    }

    //一、范围
    addSpan(newElement: string) {
        this.span.add(newElement)
    }
    deleteSpan(oldElement: string) {
        //删除所有含有该项
        this.data.forEach(function (tagSet) {
            tagSet.delete(oldElement);
        })
        this.span.delete(oldElement)
    }
    searchSpan(keyword: string): Set<string> {
        const result = new Set<string>();
        this.span.forEach(function (category) {
            if (category.indexOf(keyword) !== -1) {
                result.add(category);
            }
        })
        return result;
    }

    //二、格子：注意格子的增加和删除与视图有相关性
    addRow(seq?: number) { //?代表可选参数，...代表剩余参数
        if (seq) {
            this.data.splice(seq, 0, new Set<string>())
        }
        else {
            this.data.push(new Set<string>())
        }
    }
    deleteRow(seq: number) {
        this.data.splice(seq, 1)
    }

    //三、选项：注意number是js类型，Number是js对象
    addItem(seq: number, newElement: string) {
        this.data[seq].add(newElement)
        this.span.add(newElement)
    }
    deleteItem(seq: number, oldElement: string) {
        this.data[seq].delete(oldElement)
    }

    //四：绘图 频次绘图 →只有放在参数里参会响应式的变化
    // drawData() {
    //     const a: Map<string, number> = new Map();
    //     this.span.forEach(function (tag) {
    //         a.set(tag, 0)
    //     })

    //     this.data.forEach(function (tagset) {
    //         tagset.forEach(function (tag) {
    //             a.set(tag, a.get(tag) + 1) //一定定义过
    //         })
    //     })

    //     const x: Array<string> = Array.from(this.span)
    //     const y = new Array<number>()
    //     for (const frequency of a.values()) {
    //         y.push(frequency)
    //     }

    //     return { x, y }

    // }



}


export { MultiSelectColumn, UrlColumn, EmailColumn } 