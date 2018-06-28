{
  "esb_ppr_repository": {
    "mappings": {
      "categories": {
        "properties": {
          "name": {
            "type": "keyword"
          },
          "service": {
            "type": "nested",
            "properties": {
              "name": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              },
              "sla": {
                "type": "long"
              },
              "soapAction": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              },
              "url": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
==============
PUT esb_ppr_repository
{
  "settings": {
    "number_of_shards": 1
  }
}

PUT esb_ppr_repository/_mapping/categories
{
  "properties": {
    "name": {
      "type": "keyword"
    },
    "service": {
      "type": "nested"
    }
  }
}
