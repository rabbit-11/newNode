import * as echarts from 'echarts'

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
    public data: Array<string>
    public isEdit: Array<boolean>
    public filterArray: Array<number>

    constructor(name: string) {
        super(name);
        this.data = [];
        this.isEdit = [];
        this.filterArray = [];
    }

    public addRow(seq?: number | string, text?: string) {
        if(typeof seq === "number") {
            this.filterArray.push(this.data.length);
            this.data.splice(seq, 0, text ? text : "");
            this.isEdit.splice(seq, 0, !this.test(text));
            
        }
        else if(typeof seq === "string"){
            this.filterArray.push(this.data.length);
            this.data.push(seq);
            this.isEdit.push(!this.test(seq));
        }
        else {
            this.filterArray.push(this.data.length);
            this.data.push("");
            this.isEdit.push(true);
        }
    }

    public deleteRow(seq: number) {
        this.data.splice(seq, 1);
        this.isEdit.splice(seq, 1);
    }

    public editRow(seq: number) {
        this.isEdit[seq] = this.test(this.data[seq]) ? !this.isEdit[seq] : this.isEdit[seq];
    }

    private test(url) {
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

    public filter() {

    }

}

// email列
class EmailColumn extends Select {
    public data: Array<string>

    constructor(name: string) {
        super(name);
        this.data = [];
    }

    public addRow(seq?: number | string, text?: string) {
        if(typeof seq === "number") {
            this.data.splice(seq, 0, text ? text : "");
        }
        else if(typeof seq === "string"){
            this.data.push(seq);
        }
        else {
            this.data.push("");
        }
    }

    public deleteRow(seq: number) {
        if(seq) {
            this.data.splice(seq, 1);
        }
    }

    private test(email) {
        // eslint-disable-next-line no-useless-escape
        const strRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        const re = new RegExp(strRegex);
        return re.test(email);
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
    drawData() {
        const a: Map<string, number> = new Map();
        this.span.forEach(function (tag) {
            a.set(tag, 0)
        })

        this.data.forEach(function (tagset) {
            tagset.forEach(function (tag) {
                a.set(tag, a.get(tag) + 1) //一定定义过
            })
        })

        const x: Array<string> = Array.from(this.span)
        const y = new Array<number>()
        for (const frequency of a.values()) {
            y.push(frequency)
        }

        return { x, y }

    }
    draw(whiteboard: HTMLElement) {
        // 基于准备好的dom，初始化echarts实例
        const myChart = echarts.init(whiteboard);

        // 指定图表的配置项和数据
        const option = {
            //1、标题
            title: {
                text: this.name,
            },
            //2、提示
            tooltip: {
                //axis坐标轴触发(柱状图、折线图)、item数据项触发(散点图、饼图)
                trigger: "axis",
            },
            //3、图例：代表有几条线
            legend: {
                //series里面如果有name值，则legend里面的data可以删掉
                //data:['销量','进货']
            },
            //4、工具：可以另存为图片
            toolbox: {
                feature: {
                    saveAsImage: {},
                },
            },
            //1、大小
            grid: {
                //举例DOM元素边缘的大小
                left: "10%",
                right: "4%",
                bottom: "3%",
                //代表是否显示刻度标签
                containLabel: true,
            },
            xAxis: {
                type: "category",
                boundaryGap: "true", //代表离y轴线有一段举例
                data: this.drawData().x
            },
            yAxis: {
                type: "value",
            },

            //图表类型数据配置
            series: [
                {
                    name: "数量",
                    type: "line",
                    data: this.drawData().y
                }
            ],
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    }
    //五：处理：排序、筛选、分组、视图



}

//测试代码
function MultiSelectColumnTest() {
    const c1 = new MultiSelectColumn("类型");
    c1.addRow();
    c1.addRow();

    c1.addItem(1, "算法")
    c1.addItem(1, "计算机")

    console.log(c1.span)
    console.log(c1.data[1])
    console.log("预期结果为Set集合的['算法','计算机']")
}


export { MultiSelectColumn, UrlColumn, EmailColumn }  //ts默认的导出方式是node.js的导出，如何将其设置为es6？