import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    // This logs the text of every post off the firehose.
    // Just for fun :)
    // Delete before actually using
    for (const post of ops.posts.creates) {
      console.log(post.record.text)
    }
    
const whiteList = ['Crypto', 'NSFW', 'Cat'];
const whiteList1 = whiteList.map((val) => {
  return val.toLowerCase();
});
const banValues = ['twitter', 'pepe', 'giveaway', 'airdrop'];
const banVal1 = banValues.map((val) => {
  return val.toLowerCase();
});

const postsToDelete = ops.posts.deletes.map((del) => del.uri);
// console.log('postsToDelete ', postsToDelete);
// Must circle back on this

const postsToCreate = ops.posts.creates.filter((create) => {
  const lowercaseText = create.record.text.toLowerCase();
  
  const includeswhiteList = whiteList1.some(value => lowercaseText.includes(value));
  const includesBanValues = banVal1.some(value => lowercaseText.includes(value));

  return includeswhiteList && !includesBanValues;
})      
      .map((create) => {
        // map crypto-related posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })
      

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
