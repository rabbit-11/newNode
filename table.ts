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
    filter: MultiSelectFilter;

    constructor(name: string) {
        super(name)
        this.span = new Set<string>();
        this.data = new Array<Set<string>>();
        this.filter = new MultiSelectFilter();
    }

    //一、范围
    addSpan(newElement: string) {
        this.span.add(newElement)
    }
    deleteSpan(oldElement: string) {
        //1、data：删除所有含有该项
        this.data.forEach(function (tagSet) {
            tagSet.delete(oldElement);
        })
        //2、filter
        this.filter.deleteFilter(oldElement)

        //3、span
        this.span.delete(oldElement)
    }
    searchSpan(searchSpanWord: string): Set<string> {
        var result = new Set<string>()
        this.span.forEach(function(tag) {
            if (tag.indexOf(searchSpanWord) !== -1) {
                result.add(tag)
            }
        })
        return result;
    }

    //二、格子：添加符合分组条件的行
    addRow(groupTag:string,seq?: number) {
        if (seq) {
            this.data.splice(seq, 0, new Set<string>([groupTag]))
        }
        else {
            this.data.push(new Set<string>([groupTag]))
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
    drawData(): object {
        var a: Map<string, number> = new Map()
        this.span.forEach(function (tag) {
            a.set(tag, 0)
        })

        this.data.forEach(function (tagset) {
            tagset.forEach(function (tag) {
                a.set(tag, a.get(tag) + 1) //一定定义过
            })
        })

        var x: Array<string> = Array.from(this.span)
        var y = new Array<number>()
        for (let frequency of a.values()) {
            y.push(frequency)
        }

        return { x, y }
    }
    draw(whiteboard: HTMLDivElement) {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(whiteboard);

        // 指定图表的配置项和数据
        var option = {
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

    //五：data索引→筛选→分组→排序→搜索→增加/删除
    groupResult(): Map<string, Array<number>> {
        var result = new Map<string, Array<number>>()
        result.set("其他",[])
        var data = this.filter.filterResult(this.data)
        data.forEach(rowIndex => {
            this.data[rowIndex].forEach(tag => {
                if (result.has(tag)) {
                    result.get(tag).push(rowIndex)
                }
                else {
                    result.set(tag, [rowIndex])
                }
            })
            if(this.data[rowIndex].size == 0){
                result.get("其他").push(rowIndex)
            }
        })
        return result;
    }
    sortResult(): Map<string, Array<number>> {
        var result = this.groupResult()
        return result;
    }
    searchResult(searchRowWord: string): Map<string, Array<number>> {
        var result = this.groupResult()
        if(!searchRowWord){
            return result; 
        }
        var reserve: boolean;
        result.forEach(group => {
            for (var i = 0; i < group.length; i++){
                reserve = false;
                this.data[group[i]].forEach(tag => { //group[i]代表的是RowIndex
                    if (tag.indexOf(searchRowWord) !== -1) { //代表这个关键词匹配到这个标签
                        reserve = true;
                    }
                })
                if (reserve == false) {
                    group.splice(i, 1) //代表删除这个行索引
                    i--;//当删除后i应该停留在原地，而不是加1！！！！非常重要，我是傻逼！
                }
            }
        })
        return result; 
    }
}

//多选筛选器
class MultiSelectFilter {
    relation: string;//包含||不包含
    filters: Array<Array<string>>; //filters数组每一项代表一个筛选器，筛选器第一项代表筛选器类型，第二项代表筛选器数据

    constructor() {
        this.relation = "or",
            this.filters = new Array<Array<string>>();
    }
    //筛选器编辑
    addFilter(type?: string, tag?: string) {
        if (type && tag) {
            this.filters.push([type, tag])
        }
        else {
            this.filters.push(["包含", ""])
        }
    }
    deleteFilter(ref: any) {
        if (typeof ref == "number") { //ref为数组下标：根据数组下标删除
            this.filters.splice(ref, 1)
        } else { //ref为tag名称：根据标签名字删除
            this.filters = this.filters.filter(value => value[1] != ref)
            for (var i = 0; i < this.filters.length; i++) {
                if (this.filters[i][1] == ref) {
                    this.filters.splice(i, 1);
                }
            }
        }
    }
    editFilter(seq: number, filter: string) {
        this.filters.splice(seq, 1, [this.filters[seq][0], filter])
    }

    //筛选器查找
    andFilter(filterArray: Array<Array<number>>): Array<number> {
        let a = filterArray[0];
        filterArray.forEach(item => {
            a = a.filter(x => item.indexOf(x) !== -1);
        });
        return a;
    }
    orFilter(filterArray: Array<Array<number>>): Array<number> {
        var a = new Set<number>()
        filterArray.forEach(item => {
            item.forEach(item => {
                a.add(item);
            })
        })
        return Array.from(a);
    }
    filterResult(data: Array<Set<string>>): Array<number> {
        //无筛选器:直接按顺序返回原有数组
        var result = new Array<number>();
        if (this.filters.length == 0) {
            data.forEach((value, index, array) => {
                result.push(index)
            })
            return result;
        }
        //有筛选器:求每个筛选器对应的数组，然后进行or或and的合并
        var filterArray = new Array<Array<number>>();
        this.filters.forEach((filter, filterSeq) => {
            filterArray.push(new Array<number>());
            data.forEach((tagset, index) => {
                if ((tagset.has(filter[1]) && filter[0] === "包含") || (tagset.has(filter[1]) == false && filter[0] === "不包含")) {
                    filterArray[filterSeq].push(index)
                }
            })
        })
        return this.relation == "and" ? this.andFilter(filterArray) : this.orFilter(filterArray)
    }
}

export { MultiSelectColumn }  //ts默认的导出方式是node.js的导出，如何将其设置为es6？