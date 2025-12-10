import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import TabBar from './components/TabBar.vue'

export function createApp() {
	const app = createSSRApp(App);
	
	// 注册全局组件
	app.component('TabBar', TabBar)
	
	return {
		app,
	};
}
