// import { TextField } from "tns-core-modules/ui/text-field";
// import { isAndroid } from "tns-core-modules/platform";
// import { TextInputLayout } from "nativescript-textinputlayout";

// // export class MdTextInput extends TextField {
// export class MdTextInput {
//   private _id: string;
//   private _text: string;
//   private _hint: string;
//   private _error: string;
//   private _hintTextAppearance: string;
//   private _textChange: Function;

//   //   constructor() {}

//   public get id() {
//     return this._id;
//   }
//   public set id(value: string) {
//     if (value) {
//       this._id = value;
//     }
//   }

//   public get text() {
//     return this._text;
//   }
//   public set text(value: string) {
//     if (value) {
//       this._text = value;
//     }
//   }

//   public get hint() {
//     return this._hint;
//   }
//   public set hint(value: string) {
//     if (value) {
//       this._hint = value;
//     }
//   }

//   public get error() {
//     return this._error;
//   }
//   public set error(value: string) {
//     if (value) {
//       this._error = value;
//     }
//   }

//   public get hintTextAppearance() {
//     return this._hintTextAppearance;
//   }
//   public set hintTextAppearance(value: string) {
//     if (value) {
//       this._hintTextAppearance = value;
//     }
//   }

//   public get textChange() {
//     return this._textChange;
//   }
//   public set textChange(value: Function) {
//     if (value) {
//       this._textChange = value;
//     }
//   }
// }

// export function onLoaded(args) {
//   console.log("onLoaded");
//   const textField = args.object.getViewById("input") as TextField;
//   console.log(textField);

//   console.log(args.object.parent);

//   textField.bindingContext = args.object.bindingContext;

//   if (isAndroid) {
//     // inputlayout
//     const til = args.object.getViewById("til") as TextInputLayout;
//     console.log(til);

//     console.log(args.object.hint);
//     til.hint = args.object.hint ? args.object.hint : "";

//     console.log(args.object.error);
//     til.error = args.object.error ? args.object.error : "";
//   }
// }
