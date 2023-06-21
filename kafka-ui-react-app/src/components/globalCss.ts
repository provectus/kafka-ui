import { createGlobalStyle, css } from 'styled-components';

export default createGlobalStyle(
  ({ theme }) => css`
    html {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: ${theme.default.backgroundColor};
      overflow-x: hidden;
      overflow-y: scroll;
      text-rendering: optimizeLegibility;
      text-size-adjust: 100%;
      min-width: 300px;
    }

    #root,
    body {
      width: 100%;
      position: relative;
      margin: 0;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
    }

    article,
    aside,
    figure,
    footer,
    header,
    hgroup,
    section {
      display: block;
    }

    body,
    button,
    input,
    optgroup,
    select,
    textarea {
      font-family: inherit;
    }

    code,
    pre {
      font-family: 'Roboto Mono', sans-serif;
      -moz-osx-font-smoothing: auto;
      -webkit-font-smoothing: auto;
      background-color: ${theme.code.backgroundColor};
      color: ${theme.code.color};
      font-size: 12px;
      font-weight: 400;
      padding: 2px 8px;
      border-radius: 5px;
      width: fit-content;
    }

    pre {
      overflow-x: auto;
      white-space: pre;
      word-wrap: normal;

      code {
        background-color: transparent;
        color: currentColor;
        padding: 0;
      }
    }

    a {
      color: ${theme.link.color};
      cursor: pointer;
      text-decoration: none;
      &:hover {
        color: ${theme.link.hoverColor};
      }
    }

    img {
      height: auto;
      max-width: 100%;
    }

    input[type='checkbox'],
    input[type='radio'] {
      vertical-align: baseline;
    }

    hr {
      background-color: ${theme.hr.backgroundColor};
      border: none;
      display: block;
      height: 1px;
      margin: 0;
    }

    fieldset {
      border: none;
    }

    @keyframes fadein {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .rmsc {
      --rmsc-main: #4285f4;
      --rmsc-hover: #f1f3f5;
      --rmsc-selected: #e2e6ea;
      --rmsc-border: #ccc;
      --rmsc-gray: #aaa;
      --rmsc-bg: #fff;
      --rmsc-p: 10px; /* Spacing */
      --rmsc-radius: 4px; /* Radius */
      --rmsc-h: 38px; /* Height */
    }
    .rmsc.dark {
      --rmsc-main: #4285f4;
      --rmsc-hover: #0e0c0a;
      --rmsc-selected: #1d1915;
      --rmsc-border: #333333;
      --rmsc-gray: #555555;
      --rmsc-bg: #121212;
      color: #fff;
    }
  `
);
