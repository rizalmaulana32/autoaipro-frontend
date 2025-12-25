export default {
  // Common
  common: {
    appName: 'Auto入力Pro',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    back: '戻る',
    logout: 'ログアウト',
    search: '検索',
    filter: 'フィルター',
    all: '全て',
  },

  // Navigation
  nav: {
    dashboard: 'ダッシュボード',
    properties: '物件一覧',
    settings: '設定',
  },

  // Auth
  auth: {
    login: 'ログイン',
    loginTitle: 'ログイン',
    loginDescription: 'ユーザー名とパスワードを入力してください',
    username: 'ユーザー名',
    password: 'パスワード',
    usernamePlaceholder: 'ユーザー名を入力',
    passwordPlaceholder: 'パスワードを入力',
    loggingIn: 'ログイン中...',
    propertyManagementSystem: '物件管理システム',
  },

  // Properties
  properties: {
    title: '物件管理',
    propertyList: '物件一覧',
    propertyDetail: '物件詳細',
    noProperties: '物件が見つかりません',
    fetchProperties: '物件を取得',
    searchPlaceholder: '物件名、REINS IDで検索...',
    status: 'ステータス',

    // Status labels
    statusAll: '全て',
    statusPending: '保留中',
    statusProcessing: '処理中',
    statusSuccess: '成功',
    statusFailed: '失敗',

    // Property fields
    reinsId: 'REINS ID',
    buildingName: '建物名',
    address: '住所',
    rent: '賃料',
    layout: '間取り',
    createdAt: '作成日',
    updatedAt: '更新日',
    noName: '名称未設定',

    // Property detail sections
    basicInfo: '基本情報',
    monthlyRent: '賃料',
    managementFee: '管理費',
    deposit: '敷金',
    keyMoney: '礼金',

    location: '所在地',
    buildingInfo: '建物情報',
    structure: '構造',
    floors: '階数',
    floorsUnit: '階建',
    builtDate: '築年月',

    roomInfo: '部屋情報',
    floorLocation: '所在階',
    area: '面積',

    equipmentAmenities: '設備・特徴',
    equipment: '設備',
    amenities: 'アメニティ',

    files: 'ファイル',
    floorPlan: '間取図（PDF）',
    openPdf: 'PDFを開く',
    htmlSnapshot: 'HTMLスナップショット',
    openHtml: 'HTMLを開く',
    images: '画像',
    imagesCount: '{{count}}枚',
    showAll: 'すべて表示 ({{count}})',

    metadata: 'メタデータ',
    actions: 'アクション',
    deleteProperty: '削除',
    deleteConfirm: '本当にこの物件を削除しますか？',
  },
};
