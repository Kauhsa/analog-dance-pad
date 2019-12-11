import React from 'react'
import { useFormik } from 'formik'
import styled from 'styled-components'

import scale from '../../../utils/scale'
import { basicText, largeText } from '../../../components/Typography'
import Range from '../../../components/Range'
import { range } from 'lodash-es'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../../common-types/device'
import SensorLabel from './SensorLabel'

interface FormValues {
  name: string
  sensorToButtonMapping: number[]
  releaseThreshold: string
}

interface Props {
  device: DeviceDescription
  serverAddress: string
  onSubmit: (data: Partial<DeviceConfiguration>) => void
}

const Header = styled.h3`
  ${largeText};
  margin-top: ${scale(3)};
  margin-bottom: ${scale(2)};
`

const Label = styled.label`
  display: block;
  ${basicText};
  margin-bottom: ${scale(0.5)};
`

const Form = styled.form`
  padding: ${scale(2)};
`

const FormItem = styled.div`
  margin-bottom: ${scale(2)};
`

const Input = styled.input`
  ${basicText};
  display: block;
  width: 100%;
  padding: ${scale(0.5)} ${scale(1)};
`

// TODO: extract button from elsewhere and use that.
const SaveButton = styled.button`
  ${basicText};
  margin-top: ${scale(2)};
`

const SensorText = React.memo<{ buttonIndex: number }>(props => {
  if (props.buttonIndex < 0) {
    return <>Disabled</>
  } else {
    return <>Button {props.buttonIndex + 1}</>
  }
})

const ConfigurationForm = React.memo<Props>(
  ({ device, serverAddress, onSubmit }) => {
    const formik = useFormik<FormValues>({
      enableReinitialize: true,

      initialValues: {
        name: device.configuration.name,
        sensorToButtonMapping: device.configuration.sensorToButtonMapping,
        releaseThreshold: parseFloat(
          device.configuration.releaseThreshold.toFixed(4)
        ).toString()
      },

      onSubmit: (data: FormValues) =>
        onSubmit({
          name: data.name,
          sensorToButtonMapping: data.sensorToButtonMapping,
          releaseThreshold: parseFloat(data.releaseThreshold)
        })
    })

    return (
      <Form onSubmit={formik.handleSubmit}>
        <FormItem>
          <Label htmlFor="name">Name</Label>
          <Input
            name="name"
            value={formik.values['name']}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            type="input"
            autoComplete="off"
          />
        </FormItem>

        <FormItem>
          <Label htmlFor="releaseThreshold">Release threshold</Label>
          <Input
            name="releaseThreshold"
            type="number"
            value={formik.values['releaseThreshold']}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            step={0.01}
          />
        </FormItem>

        <Header>Sensor Mapping</Header>

        {range(device.properties.sensorCount).map(i => (
          <FormItem key={i}>
            <SensorLabel
              sensorIndex={i}
              deviceId={device.id}
              serverAddress={serverAddress}
            />
            <Range
              min={-1}
              max={device.properties.sensorCount - 1}
              value={formik.values['sensorToButtonMapping'][i]}
              valueText={
                <SensorText
                  buttonIndex={formik.values['sensorToButtonMapping'][i]}
                />
              }
              onChange={(value: number) =>
                formik.setFieldValue(`sensorToButtonMapping.${i}`, value)
              }
            />
          </FormItem>
        ))}

        <SaveButton type="submit">Save</SaveButton>
      </Form>
    )
  }
)

export default ConfigurationForm
