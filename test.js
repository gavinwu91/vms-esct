[
  {
    "path": "/",
    "redirect": "/index",
    "name": "Home",
    "meta": {},
    "children": [
      {
        "path": "index",
        "name": "Index",
        "meta": {
          "title": "router.home",
          "icon": "ep:home-filled",
          "noCache": false,
          "affix": true
        }
      }
    ]
  },
  {
    "path": "/vms",
    "name": "/vmsParent",
    "redirect": "",
    "meta": {
      "hidden": false
    },
    "children": [
      {
        "path": "",
        "name": "/vms",
        "meta": {
          "title": "VMS ",
          "icon": "ep:scale-to-original",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        }
      }
    ]
  },
  {
    "path": "/vehicle/index",
    "name": "/vehicle/indexParent",
    "redirect": "",
    "meta": {
      "hidden": false
    },
    "children": [
      {
        "path": "",
        "name": "/vehicle/index",
        "meta": {
          "title": "Vehicle",
          "icon": "",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        }
      }
    ]
  },
  {
    "path": "/retrieval",
    "name": "/retrievalParent",
    "redirect": "",
    "meta": {
      "hidden": false
    },
    "children": [
      {
        "path": "",
        "name": "/retrieval",
        "meta": {
          "title": "Retrieval ",
          "icon": "ep:search",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        }
      }
    ]
  },
  {
    "path": "/alarm",
    "name": "/alarm",
    "meta": {
      "title": "Alarm",
      "icon": "ep:alarm-clock",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "face",
        "name": "Face",
        "meta": {
          "title": "Face alarm",
          "icon": "ep:avatar",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "task",
            "name": "AlarmTask",
            "meta": {
              "title": "Alarm task",
              "icon": "ep:promotion",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "alarm/facehistory",
            "name": "AlarmFaceMsg",
            "meta": {
              "title": "Face alarm history",
              "icon": "ep:bell-filled",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "alarm/vehicle",
        "name": "AlarmVehicle",
        "meta": {
          "title": "Vehicle alarm",
          "icon": "ep:bell-filled",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "plate",
            "name": "Platealarm",
            "meta": {
              "title": "Plate task",
              "icon": "ep:bell-filled",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "history",
            "name": "Platehistory",
            "meta": {
              "title": "Plate history",
              "icon": "ep:checked",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      }
    ]
  },
  {
    "path": "/profiledb",
    "name": "/profiledbParent",
    "redirect": "",
    "meta": {
      "hidden": false
    },
    "children": [
      {
        "path": "",
        "name": "/profiledb",
        "meta": {
          "title": "Profile ",
          "icon": "ep:avatar",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        }
      }
    ]
  },
  {
    "path": "/Investigation",
    "name": "/Investigation",
    "meta": {
      "title": "Investigation ",
      "icon": "ep:coin",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "video",
        "name": "Video",
        "meta": {
          "title": "Video Analysis ",
          "icon": "ep:video-play",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "multi-person",
        "name": "MultiPerson",
        "meta": {
          "title": "Multi-person Search ",
          "icon": "ep:search",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      }
    ]
  },
  {
    "path": "/device",
    "name": "/device",
    "meta": {
      "title": "Device ",
      "icon": "ep:cpu",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "camera",
        "name": "Camera",
        "meta": {
          "title": "Camera Management",
          "icon": "ep:view",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "area",
        "name": "Area",
        "meta": {
          "title": "Camera Location Managerment",
          "icon": "ep:basketball",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      }
    ]
  },
  {
    "path": "/Resource",
    "name": "/ResourceParent",
    "redirect": "",
    "meta": {
      "hidden": false
    },
    "children": [
      {
        "path": "",
        "name": "/Resource",
        "meta": {
          "title": "Resource ",
          "icon": "ep:copy-document",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        }
      }
    ]
  },
  {
    "path": "/system",
    "name": "/system",
    "meta": {
      "title": "System management ",
      "icon": "ep:tools",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "tenant",
        "name": "Tenant",
        "meta": {
          "title": "Tenant management ",
          "icon": "fa-solid:house-user",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "list",
            "name": "SystemTenant",
            "meta": {
              "title": "Tenant list ",
              "icon": "ep:house",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "package",
            "name": "SystemTenantPackage",
            "meta": {
              "title": "Tenant Plan ",
              "icon": "fa:bars",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "user",
        "name": "SystemUser",
        "meta": {
          "title": "User management ",
          "icon": "ep:avatar",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "role",
        "name": "SystemRole",
        "meta": {
          "title": "Role management ",
          "icon": "ep:user",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "menu",
        "name": "SystemMenu",
        "meta": {
          "title": "Menu management ",
          "icon": "ep:menu",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "dept",
        "name": "SystemDept",
        "meta": {
          "title": "Departmental management ",
          "icon": "fa:address-card",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "post",
        "name": "SystemPost",
        "meta": {
          "title": "Post management ",
          "icon": "fa:address-book-o",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "dict",
        "name": "SystemDictType",
        "meta": {
          "title": "Dictionary management ",
          "icon": "ep:collection",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "messages",
        "name": "Messages",
        "meta": {
          "title": "Message center ",
          "icon": "ep:chat-dot-round",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "sms",
            "name": "Sms",
            "meta": {
              "title": "SMS management ",
              "icon": "ep:message",
              "hidden": false,
              "noCache": false,
              "alwaysShow": true
            },
            "children": [
              {
                "path": "sms-channel",
                "name": "SystemSmsChannel",
                "meta": {
                  "title": "SMS channel ",
                  "icon": "fa:stack-exchange",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              },
              {
                "path": "sms-template",
                "name": "SystemSmsTemplate",
                "meta": {
                  "title": "SMS Template ",
                  "icon": "ep:connection",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              },
              {
                "path": "sms-log",
                "name": "SystemSmsLog",
                "meta": {
                  "title": "Short message log ",
                  "icon": "fa:edit",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              }
            ]
          },
          {
            "path": "mail",
            "name": "Mail",
            "meta": {
              "title": "Mailbox management ",
              "icon": "fa-solid:mail-bulk",
              "hidden": false,
              "noCache": false,
              "alwaysShow": true
            },
            "children": [
              {
                "path": "mail-account",
                "name": "SystemMailAccount",
                "meta": {
                  "title": "Mailbox account ",
                  "icon": "fa:universal-access",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              },
              {
                "path": "mail-template",
                "name": "SystemMailTemplate",
                "meta": {
                  "title": "Mail template ",
                  "icon": "fa:tag",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              },
              {
                "path": "mail-log",
                "name": "SystemMailLog",
                "meta": {
                  "title": "Mail record ",
                  "icon": "fa:edit",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              }
            ]
          },
          {
            "path": "notify",
            "name": "Notify",
            "meta": {
              "title": "On-site information management ",
              "icon": "ep:message-box",
              "hidden": false,
              "noCache": false,
              "alwaysShow": true
            },
            "children": [
              {
                "path": "notify-template",
                "name": "SystemNotifyTemplate",
                "meta": {
                  "title": "Template management ",
                  "icon": "fa:archive",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              },
              {
                "path": "notify-message",
                "name": "SystemNotifyMessage",
                "meta": {
                  "title": "Message record ",
                  "icon": "fa:edit",
                  "hidden": false,
                  "noCache": false,
                  "alwaysShow": null
                }
              }
            ]
          },
          {
            "path": "notice",
            "name": "SystemNotice",
            "meta": {
              "title": "Notice announcement ",
              "icon": "ep:takeaway-box",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "log",
        "name": "Log",
        "meta": {
          "title": "Audit log ",
          "icon": "ep:document-copy",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "operate-log",
            "name": "SystemOperateLog",
            "meta": {
              "title": "Operation log ",
              "icon": "ep:position",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "login-log",
            "name": "SystemLoginLog",
            "meta": {
              "title": "Login log ",
              "icon": "ep:promotion",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "oauth2",
        "name": "Oauth2",
        "meta": {
          "title": "OAuth 2.0 ",
          "icon": "fa:dashcube",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "oauth2/application",
            "name": "SystemOAuth2Client",
            "meta": {
              "title": "Application management ",
              "icon": "fa:hdd-o",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "token",
            "name": "SystemTokenClient",
            "meta": {
              "title": "Token management ",
              "icon": "fa:key",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "social",
        "name": "Social",
        "meta": {
          "title": "Three-way login ",
          "icon": "fa:rocket",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "client",
            "name": "SocialClient",
            "meta": {
              "title": "Tripartite application ",
              "icon": "ep:set-up",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "user",
            "name": "SocialUser",
            "meta": {
              "title": "Three-party user ",
              "icon": "ep:avatar",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      }
    ]
  },
  {
    "path": "/infra",
    "name": "/infra",
    "meta": {
      "title": "Infrastructure ",
      "icon": "ep:monitor",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "codegen",
        "name": "InfraCodegen",
        "meta": {
          "title": "Code generation ",
          "icon": "ep:document-copy",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "demo",
        "name": "Demo",
        "meta": {
          "title": "Code generation case ",
          "icon": "ep:aim",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "demo01-contact",
            "name": "Demo01Contact",
            "meta": {
              "title": "List (check for addition, deletion) ",
              "icon": "ep:bicycle",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "demo02-category",
            "name": "Demo02Category",
            "meta": {
              "title": "Tree table ",
              "icon": "fa:tree",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "demo03-normal",
            "name": "Demo03StudentNormal",
            "meta": {
              "title": "Master sub-table (standard) ",
              "icon": "fa:battery-3",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "demo03-erp",
            "name": "Demo03StudentERP",
            "meta": {
              "title": "Master Subtable (ERP) ",
              "icon": "ep:calendar",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "demo03-inner",
            "name": "Demo03StudentInner",
            "meta": {
              "title": "Master child table (inline) ",
              "icon": "fa:power-off",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "data-source-config",
        "name": "InfraDataSourceConfig",
        "meta": {
          "title": "Data source configuration ",
          "icon": "ep:data-analysis",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "build",
        "name": "InfraBuild",
        "meta": {
          "title": "Form construction ",
          "icon": "fa:wpforms",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "swagger",
        "name": "InfraSwagger",
        "meta": {
          "title": "API interface ",
          "icon": "fa:fighter-jet",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "log",
        "name": "Log",
        "meta": {
          "title": "API logging ",
          "icon": "fa:tasks",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "api-access-log",
            "name": "InfraApiAccessLog",
            "meta": {
              "title": "Access log ",
              "icon": "ep:place",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "api-error-log",
            "name": "InfraApiErrorLog",
            "meta": {
              "title": "Error log ",
              "icon": "ep:warning-filled",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "websocket",
        "name": "InfraWebSocket",
        "meta": {
          "title": "WebSocket ",
          "icon": "ep:connection",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "file",
        "name": "File",
        "meta": {
          "title": "Document management ",
          "icon": "ep:files",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "file-config",
            "name": "InfraFileConfig",
            "meta": {
              "title": "File configuration ",
              "icon": "fa-solid:file-signature",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "file",
            "name": "InfraFile",
            "meta": {
              "title": "File list ",
              "icon": "ep:upload-filled",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      },
      {
        "path": "job",
        "name": "InfraJob",
        "meta": {
          "title": "Timed task ",
          "icon": "fa-solid:tasks",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "config",
        "name": "InfraConfig",
        "meta": {
          "title": "Configuration management ",
          "icon": "fa:connectdevelop",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "monitors",
        "name": "Monitors",
        "meta": {
          "title": "Monitoring center ",
          "icon": "ep:monitor",
          "hidden": false,
          "noCache": false,
          "alwaysShow": true
        },
        "children": [
          {
            "path": "druid",
            "name": "InfraDruid",
            "meta": {
              "title": "MySQL monitoring ",
              "icon": "fa-solid:box",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "redis",
            "name": "InfraRedis",
            "meta": {
              "title": "Redis monitoring ",
              "icon": "fa:reddit-square",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "admin-server",
            "name": "InfraAdminServer",
            "meta": {
              "title": "Java monitoring ",
              "icon": "ep:coffee-cup",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          },
          {
            "path": "skywalking",
            "name": "InfraSkyWalking",
            "meta": {
              "title": "Link tracking ",
              "icon": "fa:eye",
              "hidden": false,
              "noCache": false,
              "alwaysShow": null
            }
          }
        ]
      }
    ]
  },
  {
    "path": "/Library",
    "name": "/Library",
    "meta": {
      "title": "Library ",
      "icon": "ep:office-building",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "manage",
        "name": "Manage",
        "meta": {
          "title": "Portrait library",
          "icon": "ep:coin",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "library",
        "name": "Library",
        "meta": {
          "title": "Surveillance library",
          "icon": "ep:coin",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "vehicle_db/index",
        "name": "Vehicle_db/index",
        "meta": {
          "title": "Vehicle Database",
          "icon": "ep:edit",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      }
    ]
  },
  {
    "path": "/report",
    "name": "/report",
    "meta": {
      "title": "Report management ",
      "icon": "ep:pie-chart",
      "hidden": false,
      "noCache": false,
      "alwaysShow": true
    },
    "children": [
      {
        "path": "jimu-report",
        "name": "JimuReport",
        "meta": {
          "title": "Report designer ",
          "icon": "ep:trend-charts",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "jimu-bi",
        "name": "JimuBI",
        "meta": {
          "title": "Instrument panel designer ",
          "icon": "fa:y-combinator",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      },
      {
        "path": "go-view",
        "name": "GoView",
        "meta": {
          "title": "Large screen designer ",
          "icon": "fa:area-chart",
          "hidden": false,
          "noCache": false,
          "alwaysShow": null
        }
      }
    ]
  }
]
