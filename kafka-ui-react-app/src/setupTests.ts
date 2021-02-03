/* eslint-disable */
import * as Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom/extend-expect';

Enzyme.configure({ adapter: new Adapter() });
