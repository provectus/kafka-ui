// import React from 'react';
// import { screen } from '@testing-library/dom';
// import Version from 'components/Version/Version';
// import { render } from 'lib/testHelpers';
// import { formatTimestamp } from 'lib/dateTimeHelpers';
// import { useActuatorInfo } from 'lib/hooks/api/actuatorInfo';
// import { useLatestVersion } from 'lib/hooks/api/latestVersion';
// import { actuatorInfoPayload } from 'lib/fixtures/actuatorInfo';
// import { latestVersionPayload } from 'lib/fixtures/latestVersion';
//
// jest.mock('lib/hooks/api/actuatorInfo', () => ({
//   useActuatorInfo: jest.fn(),
// }));
// jest.mock('lib/hooks/api/latestVersion', () => ({
//   useLatestVersion: jest.fn(),
// }));
//
// describe('Version Component', () => {
//   const versionTag = 'v0.5.0';
//   const snapshotTag = 'test-SNAPSHOT';
//   const commitTag = 'befd3b328e2c9c7df57b0c5746561b2f7fee8813';
//
//   const actuatorVersionPayload = actuatorInfoPayload(versionTag);
//   const formattedTimestamp = formatTimestamp(actuatorVersionPayload.build.time);
//
//   beforeEach(() => {
//     (useActuatorInfo as jest.Mock).mockImplementation(() => ({
//       data: actuatorVersionPayload,
//     }));
//     (useLatestVersion as jest.Mock).mockImplementation(() => ({
//       data: latestVersionPayload,
//     }));
//   });
//
//   describe('tag does not exist', () => {
//     it('does not render component', async () => {
//       (useActuatorInfo as jest.Mock).mockImplementation(() => ({
//         data: null,
//       }));
//       const { container } = render(<Version />);
//       expect(container.firstChild).toBeEmptyDOMElement();
//     });
//   });
//
//   describe('renders current version', () => {
//     it('renders release build version as current version', async () => {
//       render(<Version />);
//       expect(screen.getByText(versionTag)).toBeInTheDocument();
//     });
//     it('renders formatted timestamp as current version when version is commit', async () => {
//       (useActuatorInfo as jest.Mock).mockImplementation(() => ({
//         data: actuatorInfoPayload(commitTag),
//       }));
//       render(<Version />);
//       expect(screen.getByText(formattedTimestamp)).toBeInTheDocument();
//     });
//     it('renders formatted timestamp as current version when version contains -SNAPSHOT', async () => {
//       (useActuatorInfo as jest.Mock).mockImplementation(() => ({
//         data: actuatorInfoPayload(snapshotTag),
//       }));
//       render(<Version />);
//       expect(screen.getByText(formattedTimestamp)).toBeInTheDocument();
//     });
//   });
//
//   describe('outdated build version', () => {
//     it('renders warning message', async () => {
//       (useActuatorInfo as jest.Mock).mockImplementation(() => ({
//         data: actuatorInfoPayload('v0.3.0'),
//       }));
//       render(<Version />);
//       expect(
//         screen.getByTitle(
//           `Your app version is outdated. Current latest version is ${latestVersionPayload.tag_name}`
//         )
//       ).toBeInTheDocument();
//     });
//   });
//
//   describe('current commit id with link', () => {
//     it('renders', async () => {
//       render(<Version />);
//       expect(
//         screen.getByText(actuatorVersionPayload.git.commit.id)
//       ).toBeInTheDocument();
//     });
//   });
// });
