const insert = async (
  conn,
  {
    referenceId,
    fromAccountId,
    toAccountId = null,
    recipientAccountNumber = null,
    amount,
    description = null,
    initiatedByUserId
  }
) => {
  const [result] = await conn.query(
    `INSERT INTO transfers
       (
         reference_id,
         from_account_id,
         to_account_id,
         recipient_account_number,
         amount,
         description,
         initiated_by_user_id
       )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      referenceId,
      fromAccountId,
      toAccountId,
      recipientAccountNumber,
      amount,
      description,
      initiatedByUserId
    ]
  );

  return result.insertId;
};o
