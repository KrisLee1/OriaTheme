import { defineComponent, h } from "vue";
import { oriaDefaultTheme } from "@oriatheme/core";
import { useOriaTheme } from "@oriatheme/vue";
import { ThemeEditor } from "./components/oria-theme-editor";

export default defineComponent({
  setup() {
    const { runtime } = useOriaTheme();

    return () => h(ThemeEditor, { runtime, options: { source: oriaDefaultTheme, identity: { id: "oria-default-demo", name: "Default demo" } } });
  },
});
