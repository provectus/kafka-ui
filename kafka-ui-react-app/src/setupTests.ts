import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

configure({ adapter: new Adapter() });
