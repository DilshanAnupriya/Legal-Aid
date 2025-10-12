// POST /api/message
router.post("/", async (req, res) => {
  const { chatId, senderId, text } = req.body;

  const message = await Message.create({ chatId, sender: senderId, text });
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt: Date.now(),
  });

  res.status(200).json(message);
});
