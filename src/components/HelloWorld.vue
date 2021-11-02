<template>
  <table class="table table-bordered">
        <thead>
            <tr>
                <th>行数</th>
                <th>{{urlColumn.name}}</th>
                <th>{{emailColumn.name}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in urlColumn.data" :key="index">
                <td>
                    <button>{{index+1}}</button>
                    <button @click="urlColumn.deleteRow(index);emailColumn.deleteRow(index)">×</button>
                </td>
                <td>
                    <input v-if="urlColumn.isEdit[index]" type="text" v-model="urlColumn.data[index]" 
                        @blur="urlColumn.editRow(index)">
                    <a v-else :href="(urlColumn.data[index].indexOf('http://') === -1 ? 'http://' : '') + urlColumn.data[index]" target="_blank">{{ urlColumn.data[index] }}</a>
                    <button v-if="!urlColumn.isEdit[index]" @click="urlColumn.isEdit[index] = !urlColumn.isEdit[index]">编辑</button>
                </td>
                <td>
                    <input type="text" v-model="emailColumn.data[index]">
                </td>
                <!-- <td>
                    <input type="text" v-model="searchWord" />
                    <button @click="column.addItem(index,searchWord)">添加</button>
                    <button
                        v-for="(tag, index) in column.searchSpan(searchWord)"
                        @click="column.addItem(index,tag)"
                        :key="index"
                    >
                        {{tag}}
                    </button>
                </td> -->
            </tr>
        </tbody>
    </table>
    <button @click="urlColumn.addRow();emailColumn.addRow();">添加行</button>
    <div ref="whiteboard" style="width: 600px; height: 400px"></div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { UrlColumn, EmailColumn } from "../common/table/index";

@Options({

})
export default class HelloWorld extends Vue {
    public urlColumn = new UrlColumn("url类型");
    public emailColumn = new EmailColumn("email类型")
    public searchWord = "";

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
<style scoped>
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
input {
    border: none;
    padding: none;
    text-align: center;
    background-color: white;
}
</style>
