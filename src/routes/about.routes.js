const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const teamUpload = require("../middlewares/teamUpload");
const {
  createTerms,
  updateTerms,
  getTerms,
  deleteTerms,
  createContact,
  updateContact,
  getContact,
  deleteContact,
  createFaq,
  updateFaq,
  getFaqs,
  deleteFaq,
  createTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/about.controller");

const router = express.Router();

router.post(
  "/terms",
  authMiddleware,
  adminMiddleware,
  createTerms
);

router.patch(
  "/terms",
  authMiddleware,
  adminMiddleware,
  updateTerms
);

router.get(
  "/terms",
  getTerms
);

router.delete(
  "/terms",
  authMiddleware,
  adminMiddleware,
  deleteTerms
);

router.post(
  "/contact",
  authMiddleware,
  adminMiddleware,
  createContact
);

router.patch(
  "/contact",
  authMiddleware,
  adminMiddleware,
  updateContact
);

router.get(
  "/contact",
  getContact
);

router.delete(
  "/contact",
  authMiddleware,
  adminMiddleware,
  deleteContact
);

router.post(
  "/faq",
  authMiddleware,
  adminMiddleware,
  createFaq
);

router.patch(
  "/faq/:faqId",
  authMiddleware,
  adminMiddleware,
  updateFaq
);

router.get(
  "/faq",
  authMiddleware,
  getFaqs
);

router.delete(
  "/faq/:faqId",
  authMiddleware,
  adminMiddleware,
  deleteFaq
);

router.post(
  "/teams",
  authMiddleware,
  adminMiddleware,
  teamUpload.single("image"),
  createTeamMember
);

router.get(
  "/teams",
  getTeamMembers
);

router.get(
  "/teams/:teamId",
  getTeamMemberById
);

router.patch(
  "/teams/:teamId",
  authMiddleware,
  adminMiddleware,
  teamUpload.single("image"),
  updateTeamMember
);

router.delete(
  "/teams/:teamId",
  authMiddleware,
  adminMiddleware,
  deleteTeamMember
);


module.exports = router;
