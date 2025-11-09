"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function createEvent(eventData, threadID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    const {
      title,
      startTime,
      endTime,
      location,
      description,
    } = eventData;

    if (!title || !startTime) {
      return callback(new Error("Event title and start time are required"));
    }

    const form = {
      doc_id: "1824147097654964",
      variables: JSON.stringify({
        input: {
          actor_id: ctx.userID,
          event_title: title,
          event_type: "EVENT",
          location_name: location || "",
          note: description || "",
          time: Math.floor(new Date(startTime).getTime() / 1000),
          end_time: endTime ? Math.floor(new Date(endTime).getTime() / 1000) : null,
          thread_id: threadID,
          client_mutation_id: Math.round(Math.random() * 1e19).toString(),
        },
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData;
        }

        const eventInfo = {
          success: true,
          eventID: resData.data && resData.data.lightweight_event_create
            ? resData.data.lightweight_event_create.lightweight_event.id
            : null,
          title: title,
          threadID: threadID,
        };

        callback(null, eventInfo);
      })
      .catch(function (err) {
        utils.error("createEvent", err);
        return callback(err);
      });

    return returnPromise;
  };
};
