// POST /api/chat
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  let chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, receiverId],
    });
  }

  res.status(200).json(chat);
});


// GET /api/message/:chatId
router.get("/:chatId", async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).populate("sender");
  res.status(200).json(messages);
});