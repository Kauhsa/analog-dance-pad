export interface ButtonType {
  name: string
  sensors: SensorType[]
  pressed: boolean
}

export interface SensorType {
  id: number
  value: number // between 0 and 1
  threshold: number // between 0 and 1
}
