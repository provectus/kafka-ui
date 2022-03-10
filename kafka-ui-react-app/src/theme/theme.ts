/* eslint-disable import/prefer-default-export */
export const Colors = {
  neutral: {
    '0': '#FFFFFF',
    '3': '#F9FAFA',
    '5': '#F1F2F3',
    '10': '#E3E6E8',
    '15': '#D5DADD',
    '20': '#C7CED1',
    '30': '#ABB5BA',
    '40': '#8F9CA3',
    '50': '#73848C',
    '60': '#5C6970',
    '70': '#454F54',
    '80': '#2F3639',
    '90': '#171A1C',
  },
  transparency: {
    '10': 'rgba(10, 10, 10, 0.1)',
    '20': 'rgba(0, 0, 0, 0.1)',
    '50': 'rgba(34, 41, 47, 0.5)',
  },
  green: {
    '10': '#D6F5E0',
    '15': '#C2F0D1',
    '30': '#85E0A3',
    '40': '#5CD685',
    '60': '#29A352',
  },
  brand: {
    '5': '#E8E8FC',
    '10': '#D1D1FA',
    '20': '#A3A3F5',
    '50': '#4C4CFF',
    '60': '#1717CF',
    '70': '#1414B8',
  },
  red: {
    '10': '#FAD1D1',
    '20': '#F5A3A3',
    '50': '#E51A1A',
    '55': '#CF1717',
    '60': '#B81414',
  },
  yellow: {
    '10': '#FFEECC',
    '20': '#FFDD57',
  },
  blue: {
    '10': '#e3f2fd',
    '20': '#bbdefb',
    '30': '#90caf9',
    '40': '#64b5f6',
  },
};

const theme = {
  layout: {
    minWidth: '1200px',
    navBarWidth: '201px',
    navBarHeight: '3.25rem',
    stuffColor: Colors.neutral[5],
    stuffBorderColor: Colors.neutral[10],
    overlay: {
      backgroundColor: Colors.neutral[50],
    },
  },
  panelColor: Colors.neutral[0],
  breadcrumb: Colors.neutral[30],
  connectEditWarning: Colors.yellow[10],
  dropdown: {
    color: Colors.red[50],
  },
  heading: {
    h1: {
      color: Colors.neutral[90],
    },
    h3: {
      color: Colors.neutral[50],
      fontSize: '14px',
    },
  },
  alert: {
    color: {
      error: Colors.red[10],
      success: Colors.green[10],
      warning: Colors.yellow[10],
      info: Colors.neutral[10],
    },
    shadow: Colors.transparency[20],
  },
  circularAlert: {
    color: {
      error: Colors.red[50],
      success: Colors.green[40],
      warning: Colors.yellow[10],
      info: Colors.neutral[10],
    },
  },
  button: {
    primary: {
      backgroundColor: {
        normal: Colors.brand[5],
        hover: Colors.brand[10],
        active: Colors.brand[20],
        disabled: Colors.neutral[5],
      },
      color: Colors.neutral[90],
      invertedColors: {
        normal: Colors.brand[50],
        hover: Colors.brand[60],
        active: Colors.brand[60],
      },
    },
    secondary: {
      backgroundColor: {
        normal: Colors.neutral[5],
        hover: Colors.neutral[10],
        active: Colors.neutral[15],
      },
      color: Colors.neutral[90],
      invertedColors: {
        normal: Colors.neutral[50],
        hover: Colors.neutral[70],
        active: Colors.neutral[90],
      },
    },
    danger: {
      backgroundColor: {
        normal: Colors.red[50],
        hover: Colors.red[55],
        active: Colors.red[60],
        disabled: Colors.red[20],
      },
      color: Colors.neutral[90],
      invertedColors: {
        normal: Colors.brand[50],
        hover: Colors.brand[60],
        active: Colors.brand[60],
      },
    },
    height: {
      S: '24px',
      M: '32px',
      L: '40px',
    },
    fontSize: {
      S: '14px',
      M: '14px',
      L: '16px',
    },
    border: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[70],
      active: Colors.neutral[90],
    },
  },
  menu: {
    backgroundColor: {
      normal: Colors.neutral[0],
      hover: Colors.neutral[3],
      active: Colors.neutral[5],
    },
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[70],
      active: Colors.brand[70],
      isOpen: Colors.neutral[90],
    },
    statusIconColor: {
      online: Colors.green[40],
      offline: Colors.red[50],
    },
    chevronIconColor: Colors.neutral[50],
  },
  version: {
    currentVersion: {
      color: Colors.neutral[30],
    },
    symbolWrapper: {
      color: Colors.neutral[30],
    },
  },
  schema: {
    backgroundColor: {
      tr: Colors.neutral[5],
      div: Colors.neutral[0],
    },
  },
  modal: {
    backgroundColor: Colors.neutral[0],
    border: {
      top: Colors.neutral[5],
      bottom: Colors.neutral[5],
    },
    overlay: Colors.transparency[10],
    shadow: Colors.transparency[20],
  },
  table: {
    th: {
      backgroundColor: {
        normal: Colors.neutral[0],
      },
      color: {
        normal: Colors.neutral[50],
        hover: Colors.brand[50],
        active: Colors.brand[50],
      },
      previewColor: {
        normal: Colors.brand[50],
      },
    },
    td: {
      color: {
        normal: Colors.neutral[90],
      },
    },
    tr: {
      backgroundColor: {
        hover: Colors.neutral[5],
      },
    },
    link: {
      color: {
        normal: Colors.neutral[90],
      },
    },
  },
  primaryTab: {
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[90],
      active: Colors.neutral[90],
    },
    borderColor: {
      normal: 'transparent',
      hover: 'transparent',
      active: Colors.brand[50],
      nav: Colors.neutral[10],
    },
  },
  secondaryTab: {
    backgroundColor: {
      normal: Colors.neutral[0],
      hover: Colors.neutral[5],
      active: Colors.neutral[10],
    },
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[90],
      active: Colors.neutral[90],
    },
  },
  select: {
    backgroundColor: {
      normal: Colors.neutral[0],
      hover: Colors.neutral[10],
      active: Colors.neutral[10],
    },
    color: {
      normal: Colors.neutral[90],
      hover: Colors.neutral[90],
      active: Colors.neutral[90],
      disabled: Colors.neutral[30],
    },
    borderColor: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[50],
      active: Colors.neutral[70],
      disabled: Colors.neutral[10],
    },
    optionList: {
      scrollbar: {
        backgroundColor: Colors.neutral[30],
      },
    },
  },
  input: {
    borderColor: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[50],
      focus: Colors.neutral[70],
      disabled: Colors.neutral[10],
    },
    color: {
      placeholder: {
        normal: Colors.neutral[30],
        readOnly: Colors.neutral[30],
      },
      disabled: Colors.neutral[30],
      readOnly: Colors.neutral[90],
    },
    backgroundColor: {
      readOnly: Colors.neutral[5],
    },
    error: Colors.red[50],
    icon: {
      color: Colors.neutral[70],
    },
    label: {
      color: Colors.neutral[70],
    },
  },
  textArea: {
    borderColor: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[50],
      focus: Colors.neutral[70],
      disabled: Colors.neutral[10],
    },
    color: {
      placeholder: {
        normal: Colors.neutral[30],
        focus: {
          normal: 'transparent',
          readOnly: Colors.neutral[30],
        },
      },
      disabled: Colors.neutral[30],
      readOnly: Colors.neutral[90],
    },
    backgroundColor: {
      readOnly: Colors.neutral[5],
    },
  },
  tag: {
    backgroundColor: {
      green: Colors.green[10],
      gray: Colors.neutral[5],
      yellow: Colors.yellow[10],
      white: Colors.neutral[10],
      red: Colors.red[10],
      blue: Colors.blue[10],
    },
    color: Colors.neutral[90],
  },
  pagination: {
    backgroundColor: Colors.neutral[0],
    currentPage: Colors.neutral[10],
    borderColor: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[50],
      active: Colors.neutral[70],
      disabled: Colors.neutral[20],
    },
    color: {
      normal: Colors.neutral[90],
      hover: Colors.neutral[90],
      active: Colors.neutral[90],
      disabled: Colors.neutral[20],
    },
  },
  switch: {
    unchecked: Colors.brand[20],
    checked: Colors.brand[50],
    circle: Colors.neutral[0],
    disabled: Colors.neutral[10],
  },
  pageLoader: {
    borderColor: Colors.brand[50],
    borderBottomColor: Colors.neutral[0],
  },
  metrics: {
    backgroundColor: Colors.neutral[5],
    indicator: {
      backgroundColor: Colors.neutral[0],
      titleColor: Colors.neutral[50],
      warningTextColor: Colors.red[50],
      lightTextColor: Colors.neutral[30],
    },
    filters: {
      color: {
        icon: Colors.neutral[90],
        normal: Colors.neutral[50],
      },
    },
  },
  scrollbar: {
    trackColor: {
      normal: Colors.neutral[0],
      active: Colors.neutral[5],
    },
    thumbColor: {
      normal: Colors.neutral[0],
      active: Colors.neutral[50],
    },
  },
  consumerTopicContent: {
    backgroundColor: Colors.neutral[5],
  },
  topicFormLabel: {
    color: Colors.neutral[50],
  },
  topicMetaData: {
    backgroundColor: Colors.neutral[5],
    color: {
      label: Colors.neutral[50],
      value: Colors.neutral[80],
      meta: Colors.neutral[30],
    },
  },
  dangerZone: {
    borderColor: Colors.neutral[10],
    color: Colors.red[50],
  },
  configList: {
    color: Colors.neutral[30],
  },
  topicsList: {
    color: {
      normal: Colors.neutral[90],
      hover: Colors.neutral[50],
      active: Colors.neutral[90],
    },
    backgroundColor: {
      hover: Colors.neutral[5],
      active: Colors.neutral[10],
    },
  },
  icons: {
    closeIcon: Colors.neutral[30],
    warningIcon: Colors.yellow[20],
    messageToggleIcon: {
      normal: Colors.brand[50],
      hover: Colors.brand[20],
      active: Colors.brand[60],
    },
    verticalElipsisIcon: Colors.neutral[50],
    liveIcon: {
      circleBig: Colors.red[10],
      circleSmall: Colors.red[50],
    },
  },
  viewer: {
    wrapper: Colors.neutral[3],
  },
};

export type ThemeType = typeof theme;

export default theme;
