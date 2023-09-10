var express = require('express');
const router = express();

router.get('/', (req, res) => {
    return res.status(200).json({ status: "working" });
});

module.exports = router;