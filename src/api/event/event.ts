export const allEventType = [
  {source: 10, type: "3", name: "Wander detection"},
  {source: 10, type: "1", name: "Cross line detection"},
  {source: 10, type: "5", name: "Move detection"},
  {source: 10, type: "4", name: "Rioter detection"},
  {source: 10, type: "2", name: "Cross region detection"},
  {source: 10, type: "6", name: "Fight detection"},
  {source: 20, type: "258", name: "Re Trograde"},
  {source: 20, type: "266", name: "Cross Lane"},
  {source: 20, type: "257", name: "Over Line"},
  {source: 20, type: "264", name: "Parking"},
  {source: 30, type: "7", name: "Fire warning"},
  {source: 40, type: "27", name: "Vehicle detection"},
  {source: 40, type: "26", name: "Face detection"},
]

export const groupEventTypes = [
  {
    source: 10, name: "People Event", data: [
      {source: 10, type: "3", name: "Wander detection"},
      {source: 10, type: "1", name: "Cross line detection"},
      {source: 10, type: "5", name: "Move detection"},
      {source: 10, type: "4", name: "Rioter detection"},
      {source: 10, type: "2", name: "Cross region detection"},
      {source: 10, type: "6", name: "Fight detection"},
    ]
  },
  {source: 20, name: "Vehicle Event", data: [
      {source: 20, type: "258", name: "Re Trograde"},
      {source: 20, type: "266", name: "Cross Lane"},
      {source: 20, type: "257", name: "Over Line"},
      {source: 20, type: "264", name: "Parking"},
      {source: 40, type: "27", name: "Vehicle detection"},
      {source: 40, type: "26", name: "Face detection"},
    ],},
  {source: 30, name: "Environmental Event", data: [
      {source: 30, type: "7", name: "Fire warning"},
    ]}
]



