export interface State {
  menu: menuItem;
}

// 这是actions的函数，约束组件引入的时候使用
export type setMenu = (val: menuItem) => void;

// 这是getters和state公用的一些稍微复杂的类型声明
export type menuItem = string[];
