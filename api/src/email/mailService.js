import sgMail from '@sendgrid/mail';
import pug from 'pug';
import { getPeopleTwoStepsFromApp } from '../graphql/connectors';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const appUrl = process.env.APP_URL;

const sendMail = message =>
  new Promise((resolve, reject) => {
    sgMail
      .send(message)
      .then(() => {
        resolve('Email sent successfully');
      })
      .catch((error) => {
        reject(error);
      });
  });

export const sendUpdateMail = async (
  driver,
  user,
  args,
  oldHoliData,
  updatedHoliData) => {
  const HoliData = {
    description: (oldHoliData.description === updatedHoliData.description
      ? false
      : { new: updatedHoliData.description, old: oldHoliData.description }),
    title: (oldHoliData.title === updatedHoliData.title
      ? false
      : { new: updatedHoliData.title, old: oldHoliData.title }),
    owner: (oldHoliData.ownerEmail === args.ownerEmail
      ? false
      : { new: args.ownerEmail, old: oldHoliData.ownerEmail }),
  };
  if (Object.values(HoliData).every(item => item === false)) {
    return false;
  }
  const template = pug.compileFile('src/email/templates/updateHoli.pug');
  const emailHtml = template({
    HoliUrl: (oldHoliData.linkedTagId
      ? `${appUrl}${oldHoliData.linkedTagId}/${updatedHoliData.nodeId}`
      : `${appUrl}${updatedHoliData.nodeId}`
    ),
    HoliName: oldHoliData.title,
    description: HoliData.description,
    title: HoliData.title,
    owner: HoliData.owner,
    userEmail: user.email,
  });
  const people = await getPeopleTwoStepsFromApp(driver, args);
  const emails = people.map(person => (person.email))
    .filter(email => email !== user.email)
    .filter((v, i, a) => a.indexOf(v) === i);
  if (emails.length > 0) {
    const message = {
      to: emails,
      from: {
        email: process.env.FROM_EMAIL || 'team@holi.app',
        name: process.env.FROM_NAME || 'Holi',
      },
      subject: 'A tag has been updated',
      text: 'text missing for now',
      html: emailHtml,
    };
    return sendMail(message);
  }
  return false;
};

export default {
  sendUpdateMail,
};
