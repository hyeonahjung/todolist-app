import type { Language } from '../types/user.types';

interface TranslationSet {
  nav: {
    todoList: string;
    categories: string;
    logout: string;
    lightMode: string;
    darkMode: string;
    language: string;
  };
  auth: {
    title: string;
    loginTab: string;
    registerTab: string;
    email: string;
    password: string;
    name: string;
    loginBtn: string;
    loginPending: string;
    registerBtn: string;
    registerPending: string;
    noAccount: string;
    hasAccount: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    namePlaceholder: string;
    passwordHint: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordInvalid: string;
    nameRequired: string;
    nameTooLong: string;
    duplicateEmail: string;
  };
  todo: {
    pageTitle: string;
    addBtn: string;
    addModalTitle: string;
    editModalTitle: string;
    deleteModalTitle: string;
    deleteConfirmMsg: (title: string) => string;
    deleteBtn: string;
    emptyNoFilter: string;
    emptyWithFilter: string;
    complete: string;
    uncomplete: string;
    edit: string;
    delete: string;
  };
  filter: {
    allCategories: string;
    all: string;
    incomplete: string;
    complete: string;
    reset: string;
    open: string;
    close: string;
    filter: string;
  };
  todoForm: {
    titleLabel: string;
    titlePlaceholder: string;
    titleRequired: string;
    titleTooLong: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    categoryRequired: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionTooLong: string;
    dueDateLabel: string;
    dueDateInvalid: string;
    cancel: string;
    create: string;
    save: string;
    pending: string;
  };
  category: {
    pageTitle: string;
    addBtn: string;
    addFirstBtn: string;
    deleteTitle: string;
    deleteMsg: (name: string) => string;
    deleteBtn: string;
  };
  categoryList: {
    defaultSection: string;
    customSection: string;
    systemBadge: string;
    defaultHint: string;
    noCustom: string;
    edit: string;
    delete: string;
  };
  categoryForm: {
    placeholder: string;
    save: string;
    cancel: string;
    required: string;
    tooLong: string;
  };
  profile: {
    pageTitle: string;
    nameLabel: string;
    nameRequired: string;
    nameHint: string;
    nameRequiredError: string;
    nameTooLong: string;
    emailLabel: string;
    passwordSection: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    newPasswordHint: string;
    newPasswordInvalid: string;
    currentPasswordRequired: string;
    newPasswordRequired: string;
    currentPasswordInvalid: string;
    passwordNote: string;
    cancel: string;
    save: string;
    saving: string;
    deleteAccount: string;
    deleteModalTitle: string;
    deleteWarning: string;
    deletePasswordLabel: string;
    deleteCancel: string;
    deleteConfirm: string;
    deletePending: string;
    loading: string;
    updateSuccess: string;
    updateFailed: string;
  };
  toast: {
    registerSuccess: string;
    registerFailed: string;
    loginError: string;
    loginFailed: string;
    updateSuccess: string;
    updateFailed: string;
    deleteAccountError: string;
    deleteAccountPasswordError: string;
    categoryAdded: string;
    categoryDuplicate: string;
    categoryAddFailed: string;
    categoryUpdated: string;
    categoryUpdateFailed: string;
    categoryDeleted: string;
    categoryDeleteFailed: string;
    todoAdded: string;
    todoAddFailed: string;
    todoUpdated: string;
    todoUpdateFailed: string;
    todoDeleted: string;
    todoDeleteFailed: string;
  };
}

export const translations: Record<Language, TranslationSet> = {
  ko: {
    nav: {
      todoList: '할일 목록',
      categories: '카테고리',
      logout: '로그아웃',
      lightMode: '라이트 모드',
      darkMode: '다크 모드',
      language: '언어',
    },
    auth: {
      title: '할일 목록 앱',
      loginTab: '로그인',
      registerTab: '회원가입',
      email: '이메일',
      password: '비밀번호',
      name: '이름',
      loginBtn: '로그인',
      loginPending: '로그인 중...',
      registerBtn: '가입하기',
      registerPending: '처리 중...',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      emailPlaceholder: '이메일을 입력하세요',
      passwordPlaceholder: '비밀번호를 입력하세요',
      namePlaceholder: '이름을 입력하세요',
      passwordHint: '8자 이상, 영문자·숫자 포함',
      emailRequired: '이메일을 입력해주세요.',
      emailInvalid: '올바른 이메일 형식이 아닙니다.',
      passwordRequired: '비밀번호를 입력해주세요.',
      passwordInvalid: '비밀번호는 8자 이상, 영문자와 숫자를 각 1자 이상 포함해야 합니다.',
      nameRequired: '이름을 입력해주세요.',
      nameTooLong: '이름은 50자 이하여야 합니다.',
      duplicateEmail: '이미 사용 중인 이메일입니다.',
    },
    todo: {
      pageTitle: '할일 목록',
      addBtn: '+ 할일 추가',
      addModalTitle: '할일 추가',
      editModalTitle: '할일 수정',
      deleteModalTitle: '할일 삭제',
      deleteConfirmMsg: (title) => `"${title}" 할일을 삭제하시겠습니까?`,
      deleteBtn: '삭제',
      emptyNoFilter: '아직 할일이 없습니다.',
      emptyWithFilter: '조건에 맞는 할일이 없습니다.',
      complete: '완료 처리',
      uncomplete: '완료 취소',
      edit: '수정',
      delete: '삭제',
    },
    filter: {
      allCategories: '전체 카테고리',
      all: '전체',
      incomplete: '미완료',
      complete: '완료',
      reset: '필터 초기화',
      open: '열기',
      close: '닫기',
      filter: '필터',
    },
    todoForm: {
      titleLabel: '제목 *',
      titlePlaceholder: '할일 제목을 입력하세요',
      titleRequired: '제목을 입력해 주세요.',
      titleTooLong: '제목은 100자 이하여야 합니다.',
      categoryLabel: '카테고리 *',
      categoryPlaceholder: '카테고리 선택',
      categoryRequired: '카테고리를 선택해 주세요.',
      descriptionLabel: '설명',
      descriptionPlaceholder: '설명을 입력하세요 (선택)',
      descriptionTooLong: '설명은 1,000자 이하여야 합니다.',
      dueDateLabel: '종료예정일',
      dueDateInvalid: '종료예정일은 오늘 이후 날짜여야 합니다.',
      cancel: '취소',
      create: '등록하기',
      save: '저장하기',
      pending: '처리 중...',
    },
    category: {
      pageTitle: '카테고리 관리',
      addBtn: '+ 카테고리 추가',
      addFirstBtn: '+ 첫 카테고리 추가하기',
      deleteTitle: '카테고리 삭제',
      deleteMsg: (name) => `${name} 카테고리를 삭제하시겠습니까? 소속 할일은 '일반' 카테고리로 이동됩니다.`,
      deleteBtn: '삭제',
    },
    categoryList: {
      defaultSection: '기본 카테고리',
      customSection: '사용자 정의 카테고리',
      systemBadge: '시스템',
      defaultHint: '기본 카테고리 — 수정/삭제 불가',
      noCustom: '사용자 정의 카테고리가 없습니다.',
      edit: '수정',
      delete: '삭제',
    },
    categoryForm: {
      placeholder: '카테고리명 입력 (최대 30자)',
      save: '저장',
      cancel: '취소',
      required: '카테고리명을 입력해 주세요.',
      tooLong: '카테고리명은 30자 이하여야 합니다.',
    },
    profile: {
      pageTitle: '개인정보 수정',
      nameLabel: '이름 (name)',
      nameRequired: '*필수',
      nameHint: '최소 1자, 최대 50자',
      nameRequiredError: '이름을 입력해주세요.',
      nameTooLong: '이름은 50자 이하여야 합니다.',
      emailLabel: '이메일 (email)',
      passwordSection: '--- 비밀번호 변경 (선택사항) ---',
      currentPasswordLabel: '현재 비밀번호',
      newPasswordLabel: '새 비밀번호',
      newPasswordHint: '영문자·숫자 각 1자 이상, 8~64자',
      newPasswordInvalid: '비밀번호는 8자 이상, 영문자와 숫자를 각 1자 이상 포함해야 합니다.',
      currentPasswordRequired: '현재 비밀번호를 입력해주세요.',
      newPasswordRequired: '새 비밀번호를 입력해주세요.',
      currentPasswordInvalid: '현재 비밀번호가 올바르지 않습니다.',
      passwordNote: '※ 비밀번호 변경을 원하지 않으면 비워두세요.',
      cancel: '취소',
      save: '저장하기',
      saving: '저장 중...',
      deleteAccount: '회원 탈퇴',
      deleteModalTitle: '회원 탈퇴',
      deleteWarning: '주의: 탈퇴 시 내 계정, 카테고리, 할일이 즉시 삭제되며 복구할 수 없습니다.',
      deletePasswordLabel: '비밀번호를 입력하세요:',
      deleteCancel: '취소',
      deleteConfirm: '탈퇴 확인',
      deletePending: '처리 중...',
      loading: '불러오는 중...',
      updateSuccess: '수정이 완료되었습니다.',
      updateFailed: '수정에 실패했습니다.',
    },
    toast: {
      registerSuccess: '회원가입이 완료되었습니다.',
      registerFailed: '회원가입에 실패했습니다.',
      loginError: '이메일 또는 비밀번호가 올바르지 않습니다.',
      loginFailed: '로그인에 실패했습니다.',
      updateSuccess: '수정이 완료되었습니다.',
      updateFailed: '수정에 실패했습니다.',
      deleteAccountError: '회원 탈퇴에 실패했습니다.',
      deleteAccountPasswordError: '현재 비밀번호가 올바르지 않습니다.',
      categoryAdded: '카테고리가 추가되었습니다.',
      categoryDuplicate: '이미 존재하는 카테고리명입니다.',
      categoryAddFailed: '카테고리 추가에 실패했습니다.',
      categoryUpdated: '카테고리가 수정되었습니다.',
      categoryUpdateFailed: '카테고리 수정에 실패했습니다.',
      categoryDeleted: '카테고리가 삭제되었습니다.',
      categoryDeleteFailed: '카테고리 삭제에 실패했습니다.',
      todoAdded: '할일이 추가되었습니다.',
      todoAddFailed: '할일 추가에 실패했습니다.',
      todoUpdated: '할일이 수정되었습니다.',
      todoUpdateFailed: '할일 수정에 실패했습니다.',
      todoDeleted: '할일이 삭제되었습니다.',
      todoDeleteFailed: '할일 삭제에 실패했습니다.',
    },
  },

  en: {
    nav: {
      todoList: 'Todo List',
      categories: 'Categories',
      logout: 'Logout',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      language: 'Language',
    },
    auth: {
      title: '할일 목록 앱',
      loginTab: 'Login',
      registerTab: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      loginBtn: 'Login',
      loginPending: 'Logging in...',
      registerBtn: 'Sign Up',
      registerPending: 'Processing...',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      namePlaceholder: 'Enter your name',
      passwordHint: 'At least 8 chars, letters & numbers',
      emailRequired: 'Email is required.',
      emailInvalid: 'Invalid email format.',
      passwordRequired: 'Password is required.',
      passwordInvalid: 'Password must be at least 8 characters with letters and numbers.',
      nameRequired: 'Name is required.',
      nameTooLong: 'Name must be 50 characters or less.',
      duplicateEmail: 'This email is already in use.',
    },
    todo: {
      pageTitle: 'Todo List',
      addBtn: '+ Add Todo',
      addModalTitle: 'Add Todo',
      editModalTitle: 'Edit Todo',
      deleteModalTitle: 'Delete Todo',
      deleteConfirmMsg: (title) => `Delete todo "${title}"?`,
      deleteBtn: 'Delete',
      emptyNoFilter: 'No todos yet.',
      emptyWithFilter: 'No todos match the filter.',
      complete: 'Mark complete',
      uncomplete: 'Mark incomplete',
      edit: 'Edit',
      delete: 'Delete',
    },
    filter: {
      allCategories: 'All Categories',
      all: 'All',
      incomplete: 'Incomplete',
      complete: 'Complete',
      reset: 'Reset Filter',
      open: 'Open',
      close: 'Close',
      filter: 'Filter',
    },
    todoForm: {
      titleLabel: 'Title *',
      titlePlaceholder: 'Enter todo title',
      titleRequired: 'Title is required.',
      titleTooLong: 'Title must be 100 characters or less.',
      categoryLabel: 'Category *',
      categoryPlaceholder: 'Select category',
      categoryRequired: 'Please select a category.',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Enter description (optional)',
      descriptionTooLong: 'Description must be 1,000 characters or less.',
      dueDateLabel: 'Due Date',
      dueDateInvalid: 'Due date must be today or later.',
      cancel: 'Cancel',
      create: 'Create',
      save: 'Save',
      pending: 'Processing...',
    },
    category: {
      pageTitle: 'Manage Categories',
      addBtn: '+ Add Category',
      addFirstBtn: '+ Add First Category',
      deleteTitle: 'Delete Category',
      deleteMsg: (name) => `Delete category "${name}"? Todos will be moved to 'General'.`,
      deleteBtn: 'Delete',
    },
    categoryList: {
      defaultSection: 'Default Categories',
      customSection: 'Custom Categories',
      systemBadge: 'System',
      defaultHint: 'Default — cannot edit/delete',
      noCustom: 'No custom categories.',
      edit: 'Edit',
      delete: 'Delete',
    },
    categoryForm: {
      placeholder: 'Category name (max 30 chars)',
      save: 'Save',
      cancel: 'Cancel',
      required: 'Category name is required.',
      tooLong: 'Category name must be 30 characters or less.',
    },
    profile: {
      pageTitle: 'Edit Profile',
      nameLabel: 'Name',
      nameRequired: '*Required',
      nameHint: 'Min 1, max 50 characters',
      nameRequiredError: 'Name is required.',
      nameTooLong: 'Name must be 50 characters or less.',
      emailLabel: 'Email',
      passwordSection: '--- Change Password (optional) ---',
      currentPasswordLabel: 'Current Password',
      newPasswordLabel: 'New Password',
      newPasswordHint: 'At least 8 chars, letters & numbers',
      newPasswordInvalid: 'Password must be at least 8 characters with letters and numbers.',
      currentPasswordRequired: 'Current password is required.',
      newPasswordRequired: 'New password is required.',
      currentPasswordInvalid: 'Current password is incorrect.',
      passwordNote: '※ Leave blank if you do not want to change your password.',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      deleteAccount: 'Delete Account',
      deleteModalTitle: 'Delete Account',
      deleteWarning: 'Warning: Your account, categories, and todos will be permanently deleted.',
      deletePasswordLabel: 'Enter your password:',
      deleteCancel: 'Cancel',
      deleteConfirm: 'Confirm Delete',
      deletePending: 'Processing...',
      loading: 'Loading...',
      updateSuccess: 'Profile updated.',
      updateFailed: 'Update failed.',
    },
    toast: {
      registerSuccess: 'Registration complete. Please log in.',
      registerFailed: 'Registration failed.',
      loginError: 'Invalid email or password.',
      loginFailed: 'Login failed.',
      updateSuccess: 'Profile updated.',
      updateFailed: 'Update failed.',
      deleteAccountError: 'Account deletion failed.',
      deleteAccountPasswordError: 'Current password is incorrect.',
      categoryAdded: 'Category added.',
      categoryDuplicate: 'This category name already exists.',
      categoryAddFailed: 'Failed to add category.',
      categoryUpdated: 'Category updated.',
      categoryUpdateFailed: 'Failed to update category.',
      categoryDeleted: 'Category deleted.',
      categoryDeleteFailed: 'Failed to delete category.',
      todoAdded: 'Todo added.',
      todoAddFailed: 'Failed to add todo.',
      todoUpdated: 'Todo updated.',
      todoUpdateFailed: 'Failed to update todo.',
      todoDeleted: 'Todo deleted.',
      todoDeleteFailed: 'Failed to delete todo.',
    },
  },

  zh: {
    nav: {
      todoList: '待办事项',
      categories: '分类',
      logout: '退出登录',
      lightMode: '浅色模式',
      darkMode: '深色模式',
      language: '语言',
    },
    auth: {
      title: '할일 목록 앱',
      loginTab: '登录',
      registerTab: '注册',
      email: '电子邮件',
      password: '密码',
      name: '姓名',
      loginBtn: '登录',
      loginPending: '登录中...',
      registerBtn: '注册',
      registerPending: '处理中...',
      noAccount: '没有账户？',
      hasAccount: '已有账户？',
      emailPlaceholder: '请输入电子邮件',
      passwordPlaceholder: '请输入密码',
      namePlaceholder: '请输入姓名',
      passwordHint: '至少8个字符，包含字母和数字',
      emailRequired: '请输入电子邮件。',
      emailInvalid: '电子邮件格式不正确。',
      passwordRequired: '请输入密码。',
      passwordInvalid: '密码必须至少8个字符，且包含字母和数字。',
      nameRequired: '请输入姓名。',
      nameTooLong: '姓名不能超过50个字符。',
      duplicateEmail: '该电子邮件已被使用。',
    },
    todo: {
      pageTitle: '待办事项',
      addBtn: '+ 添加待办',
      addModalTitle: '添加待办',
      editModalTitle: '编辑待办',
      deleteModalTitle: '删除待办',
      deleteConfirmMsg: (title) => `删除待办"${title}"？`,
      deleteBtn: '删除',
      emptyNoFilter: '暂无待办事项。',
      emptyWithFilter: '没有符合条件的待办事项。',
      complete: '标记完成',
      uncomplete: '取消完成',
      edit: '编辑',
      delete: '删除',
    },
    filter: {
      allCategories: '全部分类',
      all: '全部',
      incomplete: '未完成',
      complete: '已完成',
      reset: '重置筛选',
      open: '打开',
      close: '关闭',
      filter: '筛选',
    },
    todoForm: {
      titleLabel: '标题 *',
      titlePlaceholder: '请输入待办标题',
      titleRequired: '请输入标题。',
      titleTooLong: '标题不能超过100个字符。',
      categoryLabel: '分类 *',
      categoryPlaceholder: '选择分类',
      categoryRequired: '请选择分类。',
      descriptionLabel: '描述',
      descriptionPlaceholder: '请输入描述（选填）',
      descriptionTooLong: '描述不能超过1,000个字符。',
      dueDateLabel: '截止日期',
      dueDateInvalid: '截止日期必须是今天或之后的日期。',
      cancel: '取消',
      create: '创建',
      save: '保存',
      pending: '处理中...',
    },
    category: {
      pageTitle: '管理分类',
      addBtn: '+ 添加分类',
      addFirstBtn: '+ 添加第一个分类',
      deleteTitle: '删除分类',
      deleteMsg: (name) => `删除分类"${name}"？相关待办将移至"一般"分类。`,
      deleteBtn: '删除',
    },
    categoryList: {
      defaultSection: '默认分类',
      customSection: '自定义分类',
      systemBadge: '系统',
      defaultHint: '默认 — 不可编辑/删除',
      noCustom: '暂无自定义分类。',
      edit: '编辑',
      delete: '删除',
    },
    categoryForm: {
      placeholder: '分类名称（最多30字）',
      save: '保存',
      cancel: '取消',
      required: '请输入分类名称。',
      tooLong: '分类名称不能超过30个字符。',
    },
    profile: {
      pageTitle: '编辑个人资料',
      nameLabel: '姓名',
      nameRequired: '*必填',
      nameHint: '最少1个，最多50个字符',
      nameRequiredError: '请输入姓名。',
      nameTooLong: '姓名不能超过50个字符。',
      emailLabel: '电子邮件',
      passwordSection: '--- 修改密码（可选）---',
      currentPasswordLabel: '当前密码',
      newPasswordLabel: '新密码',
      newPasswordHint: '至少8个字符，包含字母和数字',
      newPasswordInvalid: '密码必须至少8个字符，且包含字母和数字。',
      currentPasswordRequired: '请输入当前密码。',
      newPasswordRequired: '请输入新密码。',
      currentPasswordInvalid: '当前密码不正确。',
      passwordNote: '※ 如不想修改密码，请留空。',
      cancel: '取消',
      save: '保存',
      saving: '保存中...',
      deleteAccount: '注销账户',
      deleteModalTitle: '注销账户',
      deleteWarning: '警告：注销后您的账户、分类和待办事项将被永久删除。',
      deletePasswordLabel: '请输入密码：',
      deleteCancel: '取消',
      deleteConfirm: '确认注销',
      deletePending: '处理中...',
      loading: '加载中...',
      updateSuccess: '修改成功。',
      updateFailed: '修改失败。',
    },
    toast: {
      registerSuccess: '注册成功，请登录。',
      registerFailed: '注册失败。',
      loginError: '邮箱或密码不正确。',
      loginFailed: '登录失败。',
      updateSuccess: '修改成功。',
      updateFailed: '修改失败。',
      deleteAccountError: '账户注销失败。',
      deleteAccountPasswordError: '当前密码不正确。',
      categoryAdded: '分类已添加。',
      categoryDuplicate: '该分类名称已存在。',
      categoryAddFailed: '添加分类失败。',
      categoryUpdated: '分类已更新。',
      categoryUpdateFailed: '更新分类失败。',
      categoryDeleted: '分类已删除。',
      categoryDeleteFailed: '删除分类失败。',
      todoAdded: '待办已添加。',
      todoAddFailed: '添加待办失败。',
      todoUpdated: '待办已更新。',
      todoUpdateFailed: '更新待办失败。',
      todoDeleted: '待办已删除。',
      todoDeleteFailed: '删除待办失败。',
    },
  },

  ja: {
    nav: {
      todoList: 'タスク一覧',
      categories: 'カテゴリ',
      logout: 'ログアウト',
      lightMode: 'ライトモード',
      darkMode: 'ダークモード',
      language: '言語',
    },
    auth: {
      title: '할일 목록 앱',
      loginTab: 'ログイン',
      registerTab: '新規登録',
      email: 'メールアドレス',
      password: 'パスワード',
      name: '名前',
      loginBtn: 'ログイン',
      loginPending: 'ログイン中...',
      registerBtn: '登録する',
      registerPending: '処理中...',
      noAccount: 'アカウントをお持ちでないですか？',
      hasAccount: '既にアカウントをお持ちですか？',
      emailPlaceholder: 'メールアドレスを入力してください',
      passwordPlaceholder: 'パスワードを入力してください',
      namePlaceholder: '名前を入力してください',
      passwordHint: '8文字以上、英字と数字を含む',
      emailRequired: 'メールアドレスを入力してください。',
      emailInvalid: 'メールアドレスの形式が正しくありません。',
      passwordRequired: 'パスワードを入力してください。',
      passwordInvalid: 'パスワードは8文字以上で英字と数字を含む必要があります。',
      nameRequired: '名前を入力してください。',
      nameTooLong: '名前は50文字以内にしてください。',
      duplicateEmail: 'このメールアドレスは既に使用されています。',
    },
    todo: {
      pageTitle: 'タスク一覧',
      addBtn: '+ タスク追加',
      addModalTitle: 'タスク追加',
      editModalTitle: 'タスク編集',
      deleteModalTitle: 'タスク削除',
      deleteConfirmMsg: (title) => `タスク「${title}」を削除しますか？`,
      deleteBtn: '削除',
      emptyNoFilter: 'タスクはまだありません。',
      emptyWithFilter: '条件に合うタスクがありません。',
      complete: '完了にする',
      uncomplete: '完了を取り消す',
      edit: '編集',
      delete: '削除',
    },
    filter: {
      allCategories: '全カテゴリ',
      all: '全て',
      incomplete: '未完了',
      complete: '完了',
      reset: 'フィルタをリセット',
      open: '開く',
      close: '閉じる',
      filter: 'フィルタ',
    },
    todoForm: {
      titleLabel: 'タイトル *',
      titlePlaceholder: 'タスクのタイトルを入力してください',
      titleRequired: 'タイトルを入力してください。',
      titleTooLong: 'タイトルは100文字以内にしてください。',
      categoryLabel: 'カテゴリ *',
      categoryPlaceholder: 'カテゴリを選択',
      categoryRequired: 'カテゴリを選択してください。',
      descriptionLabel: '説明',
      descriptionPlaceholder: '説明を入力してください（任意）',
      descriptionTooLong: '説明は1,000文字以内にしてください。',
      dueDateLabel: '期限日',
      dueDateInvalid: '期限日は今日以降の日付を設定してください。',
      cancel: 'キャンセル',
      create: '登録',
      save: '保存',
      pending: '処理中...',
    },
    category: {
      pageTitle: 'カテゴリ管理',
      addBtn: '+ カテゴリ追加',
      addFirstBtn: '+ 最初のカテゴリを追加',
      deleteTitle: 'カテゴリ削除',
      deleteMsg: (name) => `カテゴリ「${name}」を削除しますか？関連タスクは「一般」カテゴリに移動されます。`,
      deleteBtn: '削除',
    },
    categoryList: {
      defaultSection: 'デフォルトカテゴリ',
      customSection: 'カスタムカテゴリ',
      systemBadge: 'システム',
      defaultHint: 'デフォルト — 編集/削除不可',
      noCustom: 'カスタムカテゴリはありません。',
      edit: '編集',
      delete: '削除',
    },
    categoryForm: {
      placeholder: 'カテゴリ名（最大30文字）',
      save: '保存',
      cancel: 'キャンセル',
      required: 'カテゴリ名を入力してください。',
      tooLong: 'カテゴリ名は30文字以内にしてください。',
    },
    profile: {
      pageTitle: 'プロフィール編集',
      nameLabel: '名前',
      nameRequired: '*必須',
      nameHint: '最小1文字、最大50文字',
      nameRequiredError: '名前を入力してください。',
      nameTooLong: '名前は50文字以内にしてください。',
      emailLabel: 'メールアドレス',
      passwordSection: '--- パスワード変更（任意）---',
      currentPasswordLabel: '現在のパスワード',
      newPasswordLabel: '新しいパスワード',
      newPasswordHint: '英字・数字各1文字以上、8〜64文字',
      newPasswordInvalid: 'パスワードは8文字以上で英字と数字を含む必要があります。',
      currentPasswordRequired: '現在のパスワードを入力してください。',
      newPasswordRequired: '新しいパスワードを入力してください。',
      currentPasswordInvalid: '現在のパスワードが正しくありません。',
      passwordNote: '※ パスワードを変更しない場合は空白のままにしてください。',
      cancel: 'キャンセル',
      save: '保存する',
      saving: '保存中...',
      deleteAccount: 'アカウント削除',
      deleteModalTitle: 'アカウント削除',
      deleteWarning: '警告：退会するとアカウント、カテゴリ、タスクが即座に削除され、復元できません。',
      deletePasswordLabel: 'パスワードを入力してください：',
      deleteCancel: 'キャンセル',
      deleteConfirm: '削除を確認',
      deletePending: '処理中...',
      loading: '読み込み中...',
      updateSuccess: '変更が完了しました。',
      updateFailed: '変更に失敗しました。',
    },
    toast: {
      registerSuccess: '登録が完了しました。ログインしてください。',
      registerFailed: '登録に失敗しました。',
      loginError: 'メールアドレスまたはパスワードが正しくありません。',
      loginFailed: 'ログインに失敗しました。',
      updateSuccess: '変更が完了しました。',
      updateFailed: '変更に失敗しました。',
      deleteAccountError: 'アカウント削除に失敗しました。',
      deleteAccountPasswordError: '現在のパスワードが正しくありません。',
      categoryAdded: 'カテゴリが追加されました。',
      categoryDuplicate: 'このカテゴリ名は既に存在します。',
      categoryAddFailed: 'カテゴリの追加に失敗しました。',
      categoryUpdated: 'カテゴリが更新されました。',
      categoryUpdateFailed: 'カテゴリの更新に失敗しました。',
      categoryDeleted: 'カテゴリが削除されました。',
      categoryDeleteFailed: 'カテゴリの削除に失敗しました。',
      todoAdded: 'タスクが追加されました。',
      todoAddFailed: 'タスクの追加に失敗しました。',
      todoUpdated: 'タスクが更新されました。',
      todoUpdateFailed: 'タスクの更新に失敗しました。',
      todoDeleted: 'タスクが削除されました。',
      todoDeleteFailed: 'タスクの削除に失敗しました。',
    },
  },

  es: {
    nav: {
      todoList: 'Lista de Tareas',
      categories: 'Categorías',
      logout: 'Cerrar Sesión',
      lightMode: 'Modo Claro',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
    },
    auth: {
      title: '할일 목록 앱',
      loginTab: 'Iniciar Sesión',
      registerTab: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      name: 'Nombre',
      loginBtn: 'Iniciar Sesión',
      loginPending: 'Iniciando sesión...',
      registerBtn: 'Registrarse',
      registerPending: 'Procesando...',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      emailPlaceholder: 'Ingresa tu correo electrónico',
      passwordPlaceholder: 'Ingresa tu contraseña',
      namePlaceholder: 'Ingresa tu nombre',
      passwordHint: 'Mínimo 8 caracteres, letras y números',
      emailRequired: 'El correo electrónico es obligatorio.',
      emailInvalid: 'Formato de correo electrónico inválido.',
      passwordRequired: 'La contraseña es obligatoria.',
      passwordInvalid: 'La contraseña debe tener al menos 8 caracteres con letras y números.',
      nameRequired: 'El nombre es obligatorio.',
      nameTooLong: 'El nombre debe tener 50 caracteres o menos.',
      duplicateEmail: 'Este correo electrónico ya está en uso.',
    },
    todo: {
      pageTitle: 'Lista de Tareas',
      addBtn: '+ Agregar Tarea',
      addModalTitle: 'Agregar Tarea',
      editModalTitle: 'Editar Tarea',
      deleteModalTitle: 'Eliminar Tarea',
      deleteConfirmMsg: (title) => `¿Eliminar la tarea "${title}"?`,
      deleteBtn: 'Eliminar',
      emptyNoFilter: 'No hay tareas aún.',
      emptyWithFilter: 'No hay tareas que coincidan con el filtro.',
      complete: 'Marcar como completado',
      uncomplete: 'Marcar como incompleto',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    filter: {
      allCategories: 'Todas las Categorías',
      all: 'Todos',
      incomplete: 'Incompleto',
      complete: 'Completado',
      reset: 'Restablecer Filtro',
      open: 'Abrir',
      close: 'Cerrar',
      filter: 'Filtro',
    },
    todoForm: {
      titleLabel: 'Título *',
      titlePlaceholder: 'Ingresa el título de la tarea',
      titleRequired: 'El título es obligatorio.',
      titleTooLong: 'El título debe tener 100 caracteres o menos.',
      categoryLabel: 'Categoría *',
      categoryPlaceholder: 'Seleccionar categoría',
      categoryRequired: 'Por favor selecciona una categoría.',
      descriptionLabel: 'Descripción',
      descriptionPlaceholder: 'Ingresa una descripción (opcional)',
      descriptionTooLong: 'La descripción debe tener 1,000 caracteres o menos.',
      dueDateLabel: 'Fecha de Vencimiento',
      dueDateInvalid: 'La fecha de vencimiento debe ser hoy o posterior.',
      cancel: 'Cancelar',
      create: 'Crear',
      save: 'Guardar',
      pending: 'Procesando...',
    },
    category: {
      pageTitle: 'Gestionar Categorías',
      addBtn: '+ Agregar Categoría',
      addFirstBtn: '+ Agregar Primera Categoría',
      deleteTitle: 'Eliminar Categoría',
      deleteMsg: (name) => `¿Eliminar la categoría "${name}"? Las tareas se moverán a "General".`,
      deleteBtn: 'Eliminar',
    },
    categoryList: {
      defaultSection: 'Categorías Predeterminadas',
      customSection: 'Categorías Personalizadas',
      systemBadge: 'Sistema',
      defaultHint: 'Predeterminada — no se puede editar/eliminar',
      noCustom: 'No hay categorías personalizadas.',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    categoryForm: {
      placeholder: 'Nombre de la categoría (máx. 30 chars)',
      save: 'Guardar',
      cancel: 'Cancelar',
      required: 'El nombre de la categoría es obligatorio.',
      tooLong: 'El nombre de la categoría debe tener 30 caracteres o menos.',
    },
    profile: {
      pageTitle: 'Editar Perfil',
      nameLabel: 'Nombre',
      nameRequired: '*Obligatorio',
      nameHint: 'Mínimo 1, máximo 50 caracteres',
      nameRequiredError: 'El nombre es obligatorio.',
      nameTooLong: 'El nombre debe tener 50 caracteres o menos.',
      emailLabel: 'Correo Electrónico',
      passwordSection: '--- Cambiar Contraseña (opcional) ---',
      currentPasswordLabel: 'Contraseña Actual',
      newPasswordLabel: 'Nueva Contraseña',
      newPasswordHint: 'Al menos 8 caracteres, letras y números',
      newPasswordInvalid: 'La contraseña debe tener al menos 8 caracteres con letras y números.',
      currentPasswordRequired: 'La contraseña actual es obligatoria.',
      newPasswordRequired: 'La nueva contraseña es obligatoria.',
      currentPasswordInvalid: 'La contraseña actual es incorrecta.',
      passwordNote: '※ Deja en blanco si no deseas cambiar tu contraseña.',
      cancel: 'Cancelar',
      save: 'Guardar',
      saving: 'Guardando...',
      deleteAccount: 'Eliminar Cuenta',
      deleteModalTitle: 'Eliminar Cuenta',
      deleteWarning: 'Advertencia: Tu cuenta, categorías y tareas serán eliminadas permanentemente.',
      deletePasswordLabel: 'Ingresa tu contraseña:',
      deleteCancel: 'Cancelar',
      deleteConfirm: 'Confirmar Eliminación',
      deletePending: 'Procesando...',
      loading: 'Cargando...',
      updateSuccess: 'Perfil actualizado.',
      updateFailed: 'Error al actualizar.',
    },
    toast: {
      registerSuccess: 'Registro completado. Por favor inicia sesión.',
      registerFailed: 'Error al registrarse.',
      loginError: 'Correo o contraseña incorrectos.',
      loginFailed: 'Error al iniciar sesión.',
      updateSuccess: 'Perfil actualizado.',
      updateFailed: 'Error al actualizar.',
      deleteAccountError: 'Error al eliminar la cuenta.',
      deleteAccountPasswordError: 'La contraseña actual es incorrecta.',
      categoryAdded: 'Categoría agregada.',
      categoryDuplicate: 'Este nombre de categoría ya existe.',
      categoryAddFailed: 'Error al agregar categoría.',
      categoryUpdated: 'Categoría actualizada.',
      categoryUpdateFailed: 'Error al actualizar categoría.',
      categoryDeleted: 'Categoría eliminada.',
      categoryDeleteFailed: 'Error al eliminar categoría.',
      todoAdded: 'Tarea agregada.',
      todoAddFailed: 'Error al agregar tarea.',
      todoUpdated: 'Tarea actualizada.',
      todoUpdateFailed: 'Error al actualizar tarea.',
      todoDeleted: 'Tarea eliminada.',
      todoDeleteFailed: 'Error al eliminar tarea.',
    },
  },
};

