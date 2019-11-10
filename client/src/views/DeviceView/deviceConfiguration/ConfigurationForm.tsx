import React from 'react'
import { Formik, Field } from 'formik'
import {
  DeviceDescription,
  DeviceConfiguration
} from '../../../../../common-types/device'
import styled from 'styled-components'
import scale from '../../../utils/scale'
import { range } from 'lodash-es'
import { smallText } from '../../../components/Typography'

interface FormValues {
  name: string
  sensorToButtonMapping: string[]
  releaseThreshold: string
}

interface Props {
  device: DeviceDescription
  onSubmit: (data: Partial<DeviceConfiguration>) => void
}

const Label = styled.label`
  display: block;
  margin-bottom: ${scale(2)};
  ${smallText};

  > * {
    display: block;
  }
`

const Form = styled.form`
  padding: ${scale(2)};
`

const ConfigurationForm = React.memo<Props>(({ device, onSubmit }) => {
  const initialValues = React.useMemo<FormValues>(
    () => ({
      name: device.configuration.name,
      sensorToButtonMapping: device.configuration.sensorToButtonMapping.map(
        buttonIndex => buttonIndex.toString()
      ),
      releaseThreshold: parseFloat(
        device.configuration.releaseThreshold.toFixed(4)
      ).toString()
    }),
    [
      device.configuration.name,
      device.configuration.releaseThreshold,
      device.configuration.sensorToButtonMapping
    ]
  )

  const handleSubmit = React.useCallback(
    (data: FormValues) => {
      return onSubmit({
        name: data.name,
        sensorToButtonMapping: data.sensorToButtonMapping.map(buttonIndex =>
          parseInt(buttonIndex, 10)
        ),
        releaseThreshold: parseFloat(data.releaseThreshold)
      })
    },
    [onSubmit]
  )

  return (
    <Formik<FormValues>
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Label>
            Name
            <Field type="input" name="name" autoComplete="off" />
          </Label>

          {device.configuration.sensorToButtonMapping.map((_, i) => (
            <Label key={i}>
              Sensor {i + 1}
              <Field as="select" name={`sensorToButtonMapping.${i}`}>
                <option value={-1}>Disabled</option>

                {range(device.properties.buttonCount).map(i => (
                  <option key={i} value={i}>
                    Button {i + 1}
                  </option>
                ))}
              </Field>
            </Label>
          ))}

          <Label>
            Release threshold
            <Field type="number" name="releaseThreshold" step={0.01} />
          </Label>

          <button type="submit">Save</button>
        </Form>
      )}
    </Formik>
  )
})

export default ConfigurationForm
