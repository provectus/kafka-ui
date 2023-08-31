const Colors = {
  neutral: {
    '0': '#FFFFFF',
    '3': '#f9fafa',
    '4': '#f0f0f0',
    '5': '#F1F2F3',
    '10': '#E3E6E8',
    '15': '#D5DADD',
    '20': '#C7CED1',
    '25': '#C4C4C4',
    '30': '#ABB5BA',
    '40': '#8F9CA3',
    '50': '#73848C',
    '60': '#5C6970',
    '70': '#454F54',
    '75': '#394246',
    '80': '#2F3639',
    '85': '#22282A',
    '87': '#1E2224',
    '90': '#171A1C',
    '95': '#0B0D0E',
    '100': '#000',
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
    '50': '#33CC66',
    '60': '#29A352',
  },
  brand: {
    '5': '#E8E8FC',
    '10': '#D1D1FA',
    '15': '#B8BEF9',
    '20': '#A3A3F5',
    '30': '#7E7EF1',
    '40': '#6666FF',
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
    '45': '#5865F2',
    '50': '#5B67E3',
    '60': '#7A7AB8',
    '70': '#5959A6',
    '80': '#3E3E74',
  },
};

const baseTheme = {
  defaultIconColor: Colors.neutral[50],
  heading: {
    h1: {
      color: Colors.neutral[90],
    },
    h3: {
      color: Colors.neutral[50],
      fontSize: '14px',
    },
    h4: Colors.neutral[90],
    base: {
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fontWeight: 500,
      color: Colors.neutral[100],
    },
    variants: {
      1: {
        fontSize: '20px',
        lineHeight: '32px',
      },
      2: {
        fontSize: '20px',
        lineHeight: '32px',
      },
      3: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 400,
        marginBottom: '16px',
      },
      4: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
      },
      5: {
        fontSize: '12px',
        lineHeight: '16px',
      },
      6: {
        fontSize: '12px',
        lineHeight: '16px',
      },
    },
  },
  code: {
    backgroundColor: Colors.neutral[5],
    color: Colors.red[55],
  },
  layout: {
    minWidth: '1200px',
    navBarWidth: '201px',
    navBarHeight: '51px',
    rightSidebarWidth: '70vw',
    filtersSidebarWidth: '300px',

    stuffColor: Colors.neutral[5],
    stuffBorderColor: Colors.neutral[10],
    overlay: {
      backgroundColor: Colors.neutral[50],
    },
    socialLink: Colors.neutral[20],
  },
  alert: {
    color: {
      error: Colors.red[10],
      success: Colors.green[10],
      warning: Colors.yellow[10],
      info: Colors.neutral[10],
      loading: Colors.neutral[10],
      blank: Colors.neutral[10],
      custom: Colors.neutral[10],
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
  connectEditWarning: Colors.yellow[10],
  lastestVersionItem: {
    metaDataLabel: {
      color: Colors.neutral[50],
    },
  },
  icons: {
    chevronDownIcon: Colors.neutral[0],
    editIcon: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[90],
      active: Colors.neutral[100],
      border: Colors.neutral[10],
    },
    closeIcon: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[90],
      active: Colors.neutral[100],
      border: Colors.neutral[10],
    },
    cancelIcon: Colors.neutral[30],
    autoIcon: Colors.neutral[95],
    fileIcon: Colors.neutral[90],
    clockIcon: Colors.neutral[90],
    arrowDownIcon: Colors.neutral[90],
    moonIcon: Colors.neutral[95],
    sunIcon: Colors.neutral[95],
    infoIcon: Colors.neutral[30],
    closeCircleIcon: Colors.neutral[30],
    deleteIcon: Colors.red[20],
    warningIcon: Colors.yellow[20],
    warningRedIcon: {
      rectFill: Colors.red[10],
      pathFill: Colors.red[50],
    },
    messageToggleIcon: {
      normal: Colors.brand[30],
      hover: Colors.brand[40],
      active: Colors.brand[50],
    },
    verticalElipsisIcon: Colors.neutral[50],
    liveIcon: {
      circleBig: Colors.red[10],
      circleSmall: Colors.red[50],
    },
    newFilterIcon: Colors.brand[50],
    closeModalIcon: Colors.neutral[25],
    savedIcon: Colors.brand[50],
    dropdownArrowIcon: Colors.neutral[50],
    git: {
      hover: Colors.neutral[90],
      active: Colors.neutral[70],
    },
    discord: {
      normal: Colors.neutral[20],
      hover: Colors.blue[45],
      active: Colors.brand[15],
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
      secondary: Colors.neutral[15],
    },
    color: Colors.neutral[90],
  },
  switch: {
    unchecked: Colors.neutral[20],
    hover: Colors.neutral[40],
    checked: Colors.brand[50],
    circle: Colors.neutral[0],
    disabled: Colors.neutral[10],
    checkedIcon: {
      backgroundColor: Colors.neutral[10],
    },
  },
  pageLoader: {
    borderColor: Colors.brand[50],
    borderBottomColor: Colors.neutral[0],
  },
  topicFormLabel: {
    color: Colors.neutral[50],
  },
  dangerZone: {
    borderColor: Colors.red[60],
    color: {
      title: Colors.red[50],
      warningMessage: Colors.neutral[50],
    },
  },
  configList: {
    color: Colors.neutral[30],
  },
  tooltip: {
    bg: Colors.neutral[80],
    text: Colors.neutral[0],
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
  statictics: {
    createdAtColor: Colors.neutral[50],
    progressPctColor: Colors.neutral[100],
  },
  progressBar: {
    backgroundColor: Colors.neutral[3],
    compleatedColor: Colors.green[40],
    borderColor: Colors.neutral[10],
  },
  clusterConfigForm: {
    inputHintText: {
      secondary: Colors.neutral[60],
    },
    groupField: {
      backgroundColor: Colors.neutral[3],
    },
    fileInput: {
      color: Colors.neutral[85],
    },
  },
};

export const theme = {
  ...baseTheme,
  version: {
    currentVersion: {
      color: Colors.neutral[30],
    },
    commitLink: {
      color: Colors.brand[50],
    },
  },
  default: {
    color: {
      normal: Colors.neutral[90],
    },
    backgroundColor: Colors.neutral[0],
    transparentColor: 'transparent',
  },
  link: {
    color: Colors.brand[50],
    hoverColor: Colors.brand[60],
  },
  hr: {
    backgroundColor: Colors.neutral[5],
  },
  pageHeading: {
    height: '64px',
    dividerColor: Colors.neutral[30],
    backLink: {
      color: {
        normal: Colors.brand[70],
        hover: Colors.brand[60],
      },
    },
  },
  panelColor: {
    borderTop: 'none',
  },
  dropdown: {
    backgroundColor: Colors.neutral[0],
    borderColor: Colors.neutral[5],
    shadow: Colors.transparency[20],
    item: {
      color: {
        normal: Colors.neutral[90],
        danger: Colors.red[60],
      },
      backgroundColor: {
        default: Colors.neutral[0],
        hover: Colors.neutral[5],
      },
    },
  },
  ksqlDb: {
    query: {
      editor: {
        readonly: {
          background: Colors.neutral[3],
        },
        activeLine: {
          backgroundColor: Colors.neutral[5],
        },
        cell: {
          backgroundColor: Colors.neutral[10],
        },
        layer: {
          backgroundColor: Colors.neutral[5],
        },
        cursor: Colors.neutral[90],
        variable: Colors.red[50],
        aceString: Colors.green[60],
        codeMarker: Colors.yellow[20],
      },
    },
  },
  button: {
    primary: {
      backgroundColor: {
        normal: Colors.brand[50],
        hover: Colors.brand[60],
        active: Colors.brand[70],
        disabled: Colors.neutral[5],
      },
      color: {
        normal: Colors.neutral[0],
        disabled: Colors.neutral[30],
      },
      invertedColors: {
        normal: Colors.brand[50],
        hover: Colors.brand[60],
        active: Colors.brand[60],
      },
    },
    secondary: {
      backgroundColor: {
        normal: Colors.brand[5],
        hover: Colors.brand[10],
        active: Colors.brand[30],
        disabled: Colors.neutral[5],
      },
      color: {
        normal: Colors.neutral[90],
        disabled: Colors.neutral[30],
      },
      isActiveColor: Colors.neutral[0],
      invertedColors: {
        normal: Colors.neutral[50],
        hover: Colors.neutral[70],
        active: Colors.neutral[90],
        disabled: Colors.neutral[75],
      },
    },
    danger: {
      backgroundColor: {
        normal: Colors.red[50],
        hover: Colors.red[55],
        active: Colors.red[60],
        disabled: Colors.red[20],
      },
      color: {
        normal: Colors.neutral[0],
        disabled: Colors.neutral[0],
      },
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
  chips: {
    backgroundColor: {
      normal: Colors.neutral[5],
      hover: Colors.neutral[10],
      active: Colors.neutral[50],
      hoverActive: Colors.neutral[60],
    },
    color: {
      normal: Colors.neutral[70],
      hover: Colors.neutral[70],
      active: Colors.neutral[0],
      hoverActive: Colors.neutral[0],
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
      initializing: Colors.yellow[20],
    },
    chevronIconColor: Colors.neutral[50],
    titleColor: Colors.neutral[90],
  },
  schema: {
    backgroundColor: {
      tr: Colors.neutral[5],
      div: Colors.neutral[0],
      p: Colors.neutral[80],
      textarea: Colors.neutral[3],
    },
  },
  modal: {
    color: Colors.neutral[80],
    backgroundColor: Colors.neutral[0],
    border: {
      top: Colors.neutral[5],
      bottom: Colors.neutral[5],
      contrast: Colors.neutral[30],
    },
    overlay: Colors.transparency[10],
    shadow: Colors.transparency[20],
    contentColor: Colors.neutral[70],
  },
  confirmModal: {
    backgroundColor: Colors.neutral[0],
  },
  table: {
    actionBar: {
      backgroundColor: Colors.neutral[0],
    },
    th: {
      backgroundColor: {
        normal: Colors.neutral[0],
      },
      color: {
        sortable: Colors.neutral[30],
        normal: Colors.neutral[60],
        hover: Colors.brand[50],
        active: Colors.brand[50],
      },
      previewColor: {
        normal: Colors.brand[50],
      },
    },
    td: {
      borderTop: Colors.neutral[5],
      color: {
        normal: Colors.neutral[90],
      },
    },
    tr: {
      backgroundColor: {
        normal: Colors.neutral[0],
        hover: Colors.neutral[5],
      },
    },
    link: {
      color: {
        normal: Colors.neutral[90],
        hover: Colors.neutral[50],
        active: Colors.neutral[90],
      },
    },
    colored: {
      color: {
        attention: Colors.red[50],
        warning: Colors.yellow[20],
      },
    },
    expander: {
      normal: Colors.brand[30],
      hover: Colors.brand[40],
      active: Colors.brand[50],
      disabled: Colors.neutral[10],
    },
    pagination: {
      button: {
        background: Colors.neutral[90],
        border: Colors.neutral[80],
      },
      info: Colors.neutral[90],
    },
  },
  primaryTab: {
    height: '41px',
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[90],
      active: Colors.neutral[90],
      disabled: Colors.neutral[20],
    },
    borderColor: {
      active: Colors.brand[50],
      nav: Colors.neutral[5],
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
    label: Colors.neutral[50],
  },
  input: {
    borderColor: {
      normal: Colors.neutral[30],
      hover: Colors.neutral[50],
      focus: Colors.neutral[70],
      disabled: Colors.neutral[10],
    },
    color: {
      normal: Colors.neutral[90],
      placeholder: {
        normal: Colors.neutral[30],
        readOnly: Colors.neutral[30],
      },
      disabled: Colors.neutral[30],
      readOnly: Colors.neutral[90],
    },
    backgroundColor: {
      normal: Colors.neutral[0],
      readOnly: Colors.neutral[5],
      disabled: Colors.neutral[0],
    },
    error: Colors.red[50],
    icon: {
      color: Colors.neutral[70],
      hover: Colors.neutral[90],
    },
    label: {
      color: Colors.neutral[70],
    },
  },
  metrics: {
    backgroundColor: Colors.neutral[5],
    sectionTitle: Colors.neutral[90],
    indicator: {
      titleColor: Colors.neutral[50],
      warningTextColor: Colors.red[50],
      lightTextColor: Colors.neutral[30],
    },
    wrapper: Colors.neutral[0],
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
    td: {
      backgroundColor: Colors.neutral[5],
    },
  },
  topicMetaData: {
    backgroundColor: Colors.neutral[5],
    color: {
      label: Colors.neutral[50],
      value: Colors.neutral[80],
      meta: Colors.neutral[30],
    },
    liderReplica: {
      color: Colors.green[60],
    },
    outOfSync: {
      color: Colors.red[50],
    },
  },
  viewer: {
    wrapper: {
      backgroundColor: Colors.neutral[3],
      color: Colors.neutral[80],
    },
  },
  activeFilter: {
    color: Colors.neutral[70],
    backgroundColor: Colors.neutral[5],
  },
  savedFilter: {
    filterName: Colors.neutral[90],
    color: Colors.neutral[30],
  },
  editFilter: {
    textColor: Colors.brand[50],
    deleteIconColor: Colors.brand[50],
  },
  acl: {
    table: {
      deleteIcon: Colors.neutral[50],
    },
    create: {
      radioButtons: {
        green: {
          normal: {
            background: Colors.neutral[0],
            text: Colors.neutral[50],
          },
          active: {
            background: Colors.green[50],
            text: Colors.neutral[0],
          },
          hover: {
            background: Colors.green[10],
            text: Colors.neutral[90],
          },
        },
        gray: {
          normal: {
            background: Colors.neutral[0],
            text: Colors.neutral[50],
          },
          active: {
            background: Colors.neutral[10],
            text: Colors.neutral[90],
          },
          hover: {
            background: Colors.neutral[5],
            text: Colors.neutral[90],
          },
        },
        red: {},
      },
    },
  },
};

export type ThemeType = typeof theme;

export const darkTheme: ThemeType = {
  ...baseTheme,
  version: {
    currentVersion: {
      color: Colors.neutral[50],
    },
    commitLink: {
      color: Colors.brand[30],
    },
  },
  default: {
    color: {
      normal: Colors.neutral[0],
    },
    backgroundColor: Colors.neutral[90],
    transparentColor: 'transparent',
  },
  link: {
    color: Colors.brand[50],
    hoverColor: Colors.brand[30],
  },
  hr: {
    backgroundColor: Colors.neutral[80],
  },
  pageHeading: {
    height: '64px',
    dividerColor: Colors.neutral[50],
    backLink: {
      color: {
        normal: Colors.brand[30],
        hover: Colors.brand[15],
      },
    },
  },
  panelColor: {
    borderTop: Colors.neutral[80],
  },
  dropdown: {
    backgroundColor: Colors.neutral[85],
    borderColor: Colors.neutral[80],
    shadow: Colors.transparency[20],
    item: {
      color: {
        normal: Colors.neutral[0],
        danger: Colors.red[60],
      },
      backgroundColor: {
        default: Colors.neutral[85],
        hover: Colors.neutral[80],
      },
    },
  },
  ksqlDb: {
    query: {
      editor: {
        readonly: {
          background: Colors.neutral[3],
        },
        activeLine: {
          backgroundColor: Colors.neutral[80],
        },
        cell: {
          backgroundColor: Colors.neutral[75],
        },
        layer: {
          backgroundColor: Colors.neutral[80],
        },
        cursor: Colors.neutral[0],
        variable: Colors.red[50],
        aceString: Colors.green[60],
        codeMarker: Colors.yellow[20],
      },
    },
  },
  button: {
    primary: {
      backgroundColor: {
        normal: Colors.brand[30],
        hover: Colors.brand[20],
        active: Colors.brand[10],
        disabled: Colors.neutral[75],
      },
      color: {
        normal: Colors.neutral[0],
        disabled: Colors.neutral[60],
      },
      invertedColors: {
        normal: Colors.brand[30],
        hover: Colors.brand[60],
        active: Colors.brand[60],
      },
    },
    secondary: {
      backgroundColor: {
        normal: Colors.blue[80],
        hover: Colors.blue[70],
        active: Colors.blue[60],
        disabled: Colors.neutral[75],
      },
      color: {
        normal: Colors.neutral[0],
        disabled: Colors.neutral[60],
      },
      isActiveColor: Colors.neutral[90],
      invertedColors: {
        normal: Colors.neutral[50],
        hover: Colors.neutral[70],
        active: Colors.neutral[90],
        disabled: Colors.neutral[75],
      },
    },
    danger: {
      backgroundColor: {
        normal: Colors.red[50],
        hover: Colors.red[55],
        active: Colors.red[60],
        disabled: Colors.red[20],
      },
      color: {
        normal: Colors.neutral[0],
        disabled: Colors.neutral[0],
      },
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
  chips: {
    backgroundColor: {
      normal: Colors.neutral[80],
      hover: Colors.neutral[70],
      active: Colors.neutral[50],
      hoverActive: Colors.neutral[40],
    },
    color: {
      normal: Colors.neutral[0],
      hover: Colors.neutral[0],
      active: Colors.neutral[90],
      hoverActive: Colors.neutral[90],
    },
  },
  menu: {
    backgroundColor: {
      normal: Colors.neutral[90],
      hover: Colors.neutral[87],
      active: Colors.neutral[85],
    },
    color: {
      normal: Colors.neutral[40],
      hover: Colors.neutral[20],
      active: Colors.brand[20],
      isOpen: Colors.neutral[90],
    },
    statusIconColor: {
      online: Colors.green[40],
      offline: Colors.red[50],
      initializing: Colors.yellow[20],
    },
    chevronIconColor: Colors.neutral[50],
    titleColor: Colors.neutral[0],
  },
  schema: {
    backgroundColor: {
      tr: Colors.neutral[5],
      div: Colors.neutral[0],
      p: Colors.neutral[0],
      textarea: Colors.neutral[85],
    },
  },
  modal: {
    color: Colors.neutral[0],
    backgroundColor: Colors.neutral[85],
    border: {
      top: Colors.neutral[75],
      bottom: Colors.neutral[75],
      contrast: Colors.neutral[75],
    },
    overlay: Colors.transparency[10],
    shadow: Colors.transparency[20],
    contentColor: Colors.neutral[30],
  },
  confirmModal: {
    backgroundColor: Colors.neutral[80],
  },
  table: {
    actionBar: {
      backgroundColor: Colors.neutral[90],
    },
    th: {
      backgroundColor: {
        normal: Colors.neutral[90],
      },
      color: {
        sortable: Colors.neutral[30],
        normal: Colors.neutral[60],
        hover: Colors.brand[50],
        active: Colors.brand[50],
      },
      previewColor: {
        normal: Colors.brand[50],
      },
    },
    td: {
      borderTop: Colors.neutral[80],
      color: {
        normal: Colors.neutral[0],
      },
    },
    tr: {
      backgroundColor: {
        normal: Colors.neutral[90],
        hover: Colors.neutral[85],
      },
    },
    link: {
      color: {
        normal: Colors.neutral[0],
        hover: Colors.neutral[0],
        active: Colors.neutral[0],
      },
    },
    colored: {
      color: {
        attention: Colors.red[50],
        warning: Colors.yellow[20],
      },
    },
    expander: {
      normal: Colors.brand[30],
      hover: Colors.brand[40],
      active: Colors.brand[50],
      disabled: Colors.neutral[10],
    },
    pagination: {
      button: {
        background: Colors.neutral[90],
        border: Colors.neutral[80],
      },
      info: Colors.neutral[0],
    },
  },
  primaryTab: {
    height: '41px',
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[0],
      active: Colors.brand[30],
      disabled: Colors.neutral[75],
    },
    borderColor: {
      active: Colors.brand[50],
      nav: Colors.neutral[80],
    },
  },
  secondaryTab: {
    backgroundColor: {
      normal: Colors.neutral[90],
      hover: Colors.neutral[85],
      active: Colors.neutral[80],
    },
    color: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[0],
      active: Colors.neutral[0],
    },
  },
  select: {
    backgroundColor: {
      normal: Colors.neutral[85],
      hover: Colors.neutral[80],
      active: Colors.neutral[70],
    },
    color: {
      normal: Colors.neutral[0],
      hover: Colors.neutral[0],
      active: Colors.neutral[0],
      disabled: Colors.neutral[60],
    },
    borderColor: {
      normal: Colors.neutral[70],
      hover: Colors.neutral[50],
      active: Colors.neutral[70],
      disabled: Colors.neutral[70],
    },
    optionList: {
      scrollbar: {
        backgroundColor: Colors.neutral[30],
      },
    },
    label: Colors.neutral[50],
  },
  input: {
    borderColor: {
      normal: Colors.neutral[70],
      hover: Colors.neutral[50],
      focus: Colors.neutral[0],
      disabled: Colors.neutral[80],
    },
    color: {
      normal: Colors.neutral[0],
      placeholder: {
        normal: Colors.neutral[60],
        readOnly: Colors.neutral[0],
      },
      disabled: Colors.neutral[80],
      readOnly: Colors.neutral[0],
    },
    backgroundColor: {
      normal: Colors.neutral[90],
      readOnly: Colors.neutral[80],
      disabled: Colors.neutral[90],
    },
    error: Colors.red[50],
    icon: {
      color: Colors.neutral[30],
      hover: Colors.neutral[0],
    },
    label: {
      color: Colors.neutral[30],
    },
  },
  metrics: {
    backgroundColor: Colors.neutral[95],
    sectionTitle: Colors.neutral[0],
    indicator: {
      titleColor: Colors.neutral[0],
      warningTextColor: Colors.red[50],
      lightTextColor: Colors.neutral[60],
    },
    wrapper: Colors.neutral[0],
    filters: {
      color: {
        icon: Colors.neutral[0],
        normal: Colors.neutral[50],
      },
    },
  },
  scrollbar: {
    trackColor: {
      normal: Colors.neutral[90],
      active: Colors.neutral[85],
    },
    thumbColor: {
      normal: Colors.neutral[75],
      active: Colors.neutral[50],
    },
  },
  consumerTopicContent: {
    td: {
      backgroundColor: Colors.neutral[95],
    },
  },
  topicMetaData: {
    backgroundColor: Colors.neutral[90],
    color: {
      label: Colors.neutral[50],
      value: Colors.neutral[0],
      meta: Colors.neutral[60],
    },
    liderReplica: {
      color: Colors.green[60],
    },
    outOfSync: {
      color: Colors.red[50],
    },
  },
  viewer: {
    wrapper: {
      backgroundColor: Colors.neutral[85],
      color: Colors.neutral[0],
    },
  },
  activeFilter: {
    color: Colors.neutral[0],
    backgroundColor: Colors.neutral[80],
  },
  savedFilter: {
    filterName: Colors.neutral[0],
    color: Colors.neutral[70],
  },
  editFilter: {
    textColor: Colors.brand[30],
    deleteIconColor: Colors.brand[30],
  },
  heading: {
    ...baseTheme.heading,
    h4: Colors.neutral[0],
    base: {
      ...baseTheme.heading.base,
      color: Colors.neutral[0],
    },
  },
  code: {
    ...baseTheme.code,
    backgroundColor: Colors.neutral[95],
  },
  layout: {
    ...baseTheme.layout,
    stuffColor: Colors.neutral[75],
    stuffBorderColor: Colors.neutral[75],
    socialLink: Colors.neutral[30],
  },
  icons: {
    ...baseTheme.icons,
    editIcon: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[30],
      active: Colors.neutral[40],
      border: Colors.neutral[70],
    },
    closeIcon: {
      normal: Colors.neutral[50],
      hover: Colors.neutral[30],
      active: Colors.neutral[40],
      border: Colors.neutral[70],
    },
    cancelIcon: Colors.neutral[0],
    autoIcon: Colors.neutral[0],
    fileIcon: Colors.neutral[0],
    clockIcon: Colors.neutral[0],
    arrowDownIcon: Colors.neutral[0],
    moonIcon: Colors.neutral[0],
    sunIcon: Colors.neutral[0],
    infoIcon: Colors.neutral[70],
    savedIcon: Colors.brand[30],
    git: {
      ...baseTheme.icons.git,
      hover: Colors.neutral[70],
      active: Colors.neutral[90],
    },
    discord: {
      ...baseTheme.icons.discord,
      normal: Colors.neutral[30],
    },
  },
  textArea: {
    ...baseTheme.textArea,
    borderColor: {
      ...baseTheme.textArea.borderColor,
      normal: Colors.neutral[70],
      hover: Colors.neutral[30],
      focus: Colors.neutral[0],
    },
  },
  clusterConfigForm: {
    ...baseTheme.clusterConfigForm,
    groupField: {
      backgroundColor: Colors.neutral[85],
    },
    fileInput: {
      color: Colors.neutral[0],
    },
  },
  acl: {
    table: {
      deleteIcon: Colors.neutral[50],
    },
    create: {
      radioButtons: {
        green: {
          normal: {
            background: Colors.neutral[0],
            text: Colors.neutral[50],
          },
          active: {
            background: Colors.green[50],
            text: Colors.neutral[0],
          },
          hover: {
            background: Colors.green[10],
            text: Colors.neutral[0],
          },
        },
        gray: {
          normal: {
            background: Colors.neutral[0],
            text: Colors.neutral[50],
          },
          active: {
            background: Colors.neutral[10],
            text: Colors.neutral[90],
          },
          hover: {
            background: Colors.neutral[5],
            text: Colors.neutral[90],
          },
        },
        red: {},
      },
    },
  },
};
