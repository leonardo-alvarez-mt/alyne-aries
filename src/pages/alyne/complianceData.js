/**
 * Compliance / Questionnaires mock data.
 * @typedef {Object} Creator
 * @property {string} name
 * @property {string} [email]
 * @property {string} initials
 * @property {string} [avatarUrl]
 *
 * @typedef {Object} Questionnaire
 * @property {string} id
 * @property {string} title
 * @property {Creator} createdBy
 * @property {'Published'|'Completed'|'Draft'} state
 */

/** Full-dataset count shown in the table card (from the live app). */
export const QUESTIONNAIRES_TOTAL = 521;

export const QUESTIONNAIRE_COLUMNS = [
  { id: 'id', label: '#', width: 130 },
  { id: 'title', label: 'Title', width: 200 },
  { id: 'createdBy', label: 'Created by', width: 200 },
  { id: 'state', label: 'State', width: 200 },
];

const creator = (name, email, initials) => ({ name, email, initials });

/** @type {Questionnaire[]} */
export const QUESTIONNAIRE_ROWS = [
  { id: 'Q1606', title: 'CK_Submit Application_V10', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Published' },
  { id: 'Q1605', title: 'Travel Planning Survey', createdBy: creator('Saraswathi Singh', 'saraswathi.singh@mitratech.com', 'SS'), state: 'Published' },
  { id: 'Q1604', title: 'CK_Sec Concept_V2', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Published' },
  { id: 'Q1603', title: 'Copy of Copy of CK_Submit Application_NEW.X', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Completed' },
  { id: 'Q1600', title: 'Copy of CK_Submit Application_NEW.2', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Completed' },
  { id: 'Q1595', title: 'aaa', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Published' },
  { id: 'Q1594', title: 'Copy of Copy of Copy of Copy of Copy of Meal Tracker', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Published' },
  { id: 'Q1593', title: 'Copy of Saraswati Training', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Published' },
  { id: 'Q1592', title: 'Copy of Copy of Copy of Copy of Copy of Meal Tracker', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Draft' },
  { id: 'Q1591', title: 'Copy of Copy of Copy of Copy of Meal Tracker', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Published' },
  { id: 'Q1590', title: 'Saraswati Training', createdBy: creator('Himanshu Kanoje', 'himanshu.kanoje@mitratech.com', 'HK'), state: 'Published' },
  { id: 'Q1588', title: 'Copy of Test Questionnaire 06292026', createdBy: creator('Subhankar Das', 'subhankar.das+playground@mitratech.com', 'SD'), state: 'Published' },
  { id: 'Q1587', title: 'Melih Test', createdBy: creator('Melih Yozgyurr (Main)', 'melih.yozgyur+playground@mitratech.com', 'MY'), state: 'Published' },
  { id: 'Q1586', title: 'My GDRP questions', createdBy: creator('Benny Borchers', 'benjamin.borchers+playground@mitratech.com', 'BB'), state: 'Draft' },
  { id: 'Q1585', title: 'Security', createdBy: creator('Palak Khandelwal', 'palak.khandelwal@mitratech.com', 'PK'), state: 'Draft' },
  { id: 'Q1583', title: 'CK_Submit Application', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Published' },
  { id: 'Q1582', title: 'CK_BIA', createdBy: creator('Chris Koenig', 'christopher.konig+playground@mitratech.com', 'CK'), state: 'Published' },
  { id: 'Q1581', title: 'Copy of Questionnaire Simulation', createdBy: creator('Laura Arias', 'laura.arias+playground@mitratech.com', 'LA'), state: 'Published' },
  { id: 'Q1580', title: 'Questionnaire Simulation', createdBy: creator('Laura Arias', 'laura.arias+playground@mitratech.com', 'LA'), state: 'Draft' },
  { id: 'Q1579', title: 'Test Questionnaire 06292026', createdBy: creator('Subhankar Das', 'subhankar.das+playground@mitratech.com', 'SD'), state: 'Published' },
  { id: 'Q1578', title: 'Copy of Questionnaire for Attachments Review', createdBy: creator('Murali S', 'murali.s@mitratech.com', 'MS'), state: 'Published' },
];
