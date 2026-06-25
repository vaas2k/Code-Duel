import { Router } from "express";
import authController from "../controllers/auth_controller";
import generalController from "../controllers/general_controller";
import matchController from "../controllers/match_controller";
import codeCheck_Controller from "../controllers/codeCheck_controller";
import AdminController from "../controllers/admin_controller";
const router: Router = Router(); 


router.post("/signin",authController.signIn);
router.post('/create-account',authController.createAccount);
router.post('/forget-password',authController.forgetPassword);
router.post('/reset-password',authController.resetPassword);
router.post('/verify-account',authController.verifyAccount);
router.post('/logout-account',authController.logoutAccount);

// match routes
router.post('/get-stats',matchController.getStats);
router.post('/cancel-matchmaking',matchController.dequeuePlayer);
router.post('/queue-for-match',matchController.queueForMatch);
router.post('/time-expiry',matchController.timeExpire);
router.post('/notify-passed-all',matchController.matchWin);
router.post('/notify-loss',matchController.matchLose);
router.post('/match-abort',matchController.matchAbort);
router.post('/get-rankings',matchController.getRankings);
router.post('/match-history',matchController.matchHistory);


//code routes
router.post('/all-test-check',codeCheck_Controller.runAllTestCases);


// feedbacks
router.post('/add-feedback',generalController.addFeedback);

// admin routes
router.get('/admin-stats',AdminController.stats);
router.get('/admin-users',AdminController.users);
router.get('/admin-feedbacks',AdminController.feedbacks);
router.get('/admin-matches',AdminController.matches);
router.get('/admin-problems',AdminController.problems);
router.post('/admin-user-activity',AdminController.userActivity);
router.post('/admin-feedback-activity',AdminController.feedbackActivity);

// get problem
router.post('/problem',codeCheck_Controller.getProblem)
router.post('/admin-add_problem',AdminController.add_problem);
router.post('/admin-delete_problem',AdminController.delete_problem);
router.post('/admin-update_problem',AdminController.update_problem);
router.post('/admin-add_testCase',AdminController.addTestCases);

export default router;