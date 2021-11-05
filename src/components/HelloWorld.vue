<template>
    <div><button @click="urlColumn.addRow();emailColumn.addRow();">添加行</button></div>
    <div>
        <table class="table table-bordered" border="1">
            <thead>
                <tr>
                    <th>行数</th>
                    <th>{{urlColumn.name}}</th>
                    <th>{{emailColumn.name}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in urlColumn.filter.filterResult(urlColumn.data)" :key="index">
                    <td>
                        <button>{{item+1}}</button>
                        <button @click="urlColumn.deleteRow(item);emailColumn.deleteRow(item)">×</button>
                    </td>
                    <td>
                        <input v-if="urlColumn.isEdit[item]" type="text" v-model="urlColumn.data[item]" @blur="urlColumn.editRow(item)">
                        <a v-else :href="(urlColumn.data[item].indexOf('http://') === -1 || urlColumn.data[item].indexOf('https://') === -1 ? 'http://' : '') + urlColumn.data[item]" target="_blank">{{ urlColumn.data[item] }}</a>
                        <button v-if="!urlColumn.isEdit[item]" @click="urlColumn.isEdit[item] = !urlColumn.isEdit[item]">编辑</button>
                    </td>
                    <td>
                        <input type="text" v-model="emailColumn.data[item]" @blur="emailColumn.editRow(item)">
                        <button v-if="emailColumn.isEmail[item]">@</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div><h3>筛选</h3></div>
    <div>
        <button @click="filterType = !filterType">{{ filterType ? "包含" : "不包含" }}</button>
        <input type="text" placeholder="filter" v-model="filterWord">
        <button @click="urlColumn.filter.addFilter(filterType ? '包含' : '不包含',filterWord)">添加</button>
    </div>
    <div v-for="(item, index) in urlColumn.filter.filters" :key="index">
        <button>{{ item[0] }}</button>
        <button>{{ item[1] }}</button>
        <button @click="urlColumn.filter.deleteFilter(index)">×</button>
    </div>
    <div><h3>分组</h3></div>
    <div>
        <table class="table table-bordered" border="1" v-for="(map,mapIndex) in urlColumn.groupResult()" :key="mapIndex">
            <thead>
                <tr>
                    <th>{{map[0]}}</th>
                    <th>{{urlColumn.name}}</th>
                    <th>{{emailColumn.name}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in map[1]" :key="index">
                    <td>
                        <button>{{item+1}}</button>
                        <button @click="urlColumn.deleteRow(item);emailColumn.deleteRow(item)">×</button>
                    </td>
                    <td>
                        <input v-if="urlColumn.isEdit[item]" type="text" v-model="urlColumn.data[item]" @blur="urlColumn.editRow(item)">
                        <a v-else :href="(urlColumn.data[item].indexOf('http://') === -1 || urlColumn.data[item].indexOf('https://') === -1 ? 'http://' : '') + urlColumn.data[item]" target="_blank">{{ urlColumn.data[item] }}</a>
                        <button v-if="!urlColumn.isEdit[item]" @click="urlColumn.isEdit[item] = !urlColumn.isEdit[item]">编辑</button>
                    </td>
                    <td>
                        <input type="text" v-model="emailColumn.data[item]" @blur="emailColumn.editRow(item)">
                        <button v-if="emailColumn.isEmail[item]">@</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- <v-chart class="my-chart" :options="bar" style="width: 600px; height: 400px"></v-chart> --> 
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { UrlColumn, EmailColumn } from "../common/table/index";

@Options({

})
export default class HelloWorld extends Vue {
    public urlColumn = new UrlColumn("url类型");
    public emailColumn = new EmailColumn("email类型")
    public filterWord = "";
    public filterType = true;

    created() {
    //   this.$watch('column', () => {
    //     this.column.draw(this.$refs.whiteboard as HTMLElement);
    //   },
    //   {deep: true});
    }

    mounted() {
        this.urlColumn.addRow("www.baidu.com");
        this.urlColumn.addRow("www.bilibili.com");
        this.urlColumn.addRow("www.taobao.com");
        this.urlColumn.addRow("www.baidu.com");

        this.emailColumn.addRow("312563541@qq.com");
        this.emailColumn.addRow("312563542@qq.com");
        this.emailColumn.addRow("312563543@qq.com");
        this.emailColumn.addRow("312563544@qq.com");
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
div {
    margin-bottom: 5px;
}
table{
    margin: auto;

    input {
        border: none;
        padding: none;
        text-align: center;
        background-color: white;
        outline: none;
    }
}
</style>
