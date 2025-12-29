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
    autoInputSuumo: 'SUUMO自動入力',
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
    searchPlaceholder: '全ての属性で検索...',

    // Filters
    filters: '絞り込み',
    filterProperties: '物件を絞り込む',
    filterDescription: '詳細フィルターで物件検索を絞り込む',
    applyFilters: 'フィルターを適用',
    clearFilters: 'すべてクリア',
    clearAll: 'すべてクリア',
    activeFilters: '有効なフィルター',
    minRent: '最低賃料',
    maxRent: '最高賃料',
    minArea: '最小面積 (m²)',
    maxArea: '最大面積 (m²)',
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
    priceInfo: '価格情報',
    monthlyRent: '賃料',
    managementFee: '管理費',
    commonServiceFee: '共益費',
    securityDeposit: '敷金',
    keyMoney: '礼金',
    guaranteeDeposit: '保証金',

    location: '所在地',
    prefecture: '都道府県',
    city: '市区町村',
    town: '町名',
    addressDetail: '番地',
    roomNumber: '部屋番号',

    transportation: '交通',
    railwayLine: '路線',
    station: '駅',
    walkMinutes: '徒歩',
    minutes: '分',

    buildingInfo: '建物情報',
    structure: '構造',
    buildingStructure: '建物構造',
    aboveGroundFloors: '地上階数',
    undergroundFloors: '地下階数',
    floors: '階数',
    floorsUnit: '階建',
    builtDate: '築年月',
    constructionDate: '建築年月',

    roomInfo: '部屋情報',
    floorLocation: '所在階',
    layoutType: '間取りタイプ',
    roomCount: '部屋数',
    area: '面積',
    usableArea: '専有面積',
    balconyArea: 'バルコニー面積',
    balconyDirection: 'バルコニー向き',

    equipmentAmenities: '設備・特徴',
    equipment: '設備',
    amenities: 'アメニティ',

    files: 'ファイル',
    floorPlan: '間取図（PDF）',
    openPdf: 'PDFを開く',
    downloadPdf: 'PDFをダウンロード',
    htmlSnapshot: 'HTMLスナップショット',
    openHtml: 'HTMLを開く',
    downloadHtml: 'HTMLをダウンロード',
    images: '画像',
    imagesCount: '{{count}}枚',
    showAll: 'すべて表示 ({{count}})',
    noImages: '画像がありません',

    metadata: 'メタデータ',
    actions: 'アクション',
    deleteProperty: '削除',
    deleteConfirm: '本当にこの物件を削除しますか？',
  },

  // Auto Input SUUMO
  autoInputSuumo: {
    description: 'SUUMOポータルに物件データを自動入力',
    comingSoonTitle: '近日公開',
    comingSoonMessage: 'この機能は現在開発中です。まもなくSUUMOポータルへの物件データの自動入力が可能になります。',
  },
};
