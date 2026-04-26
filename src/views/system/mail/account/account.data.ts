import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import { dateFormatter } from '@/utils/formatTime'
const { t } = useI18n() // 国际化

// 表单校验
export const rules = reactive({
  mail: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.rules.truemail'),
      trigger: ['blur', 'change']
    }
  ],
  username: [required],
  password: [required],
  host: [required],
  port: [required],
  sslEnable: [required],
  starttlsEnable: [required]
})

// CrudSchema：https://doc.iocoder.cn/vue3/crud-schema/
const crudSchemas = reactive<CrudSchema[]>([
  {
    label: 'Email',
    field: 'mail',
    isSearch: true,
    search: {
      componentProps: {
        style: {
          width: '240px'
        }
      }
    }
  },
  {
    label: 'User name',
    field: 'username',
    isSearch: true,
    search: {
      componentProps: {
        style: {
          width: '240px'
        }
      }
    }
  },
  {
    label: 'Password',
    field: 'password',
    isTable: false
  },
  {
    label: 'SMTP host',
    field: 'host'
  },
  {
    label: 'SMTP port',
    field: 'port',
    form: {
      component: 'InputNumber',
      value: 465
    }
  },
  {
    label: 'Enable SSL',
    field: 'sslEnable',
    dictType: DICT_TYPE.INFRA_BOOLEAN_STRING,
    dictClass: 'boolean',
    form: {
      component: 'Radio'
    }
  },
  {
    label: 'Enable STARTTLS',
    field: 'starttlsEnable',
    dictType: DICT_TYPE.INFRA_BOOLEAN_STRING,
    dictClass: 'boolean',
    form: {
      component: 'Radio'
    }
  },
  {
    label: 'Create time',
    field: 'createTime',
    isForm: false,
    formatter: dateFormatter,
    detail: {
      dateFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    label: 'Operate',
    field: 'action',
    isForm: false,
    isDetail: false
  }
])
export const { allSchemas } = useCrudSchemas(crudSchemas)
