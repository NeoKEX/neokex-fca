/**
 * @by NeoKEX
 * Advanced AI Theme Generation with External Image API
 * Generates AI images and applies them as Messenger chat themes
 */

"use strict";

const utils = require("./utils");
const axios = require("axios");

module.exports = function (defaultFuncs, api, ctx) {
  return function generateAitheme(options, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    const {
      prompt,
      threadID,
      useExternalAPI = false,
      externalAPIUrl = "https://tawsif.is-a.dev/seedream/gen"
    } = options;

    if (!prompt) {
      const error = new Error("Prompt is required");
      utils.error("generateAitheme", error);
      return callback(error);
    }

    if (!threadID) {
      const error = new Error("ThreadID is required");
      utils.error("generateAitheme", error);
      return callback(error);
    }

    const processAITheme = async () => {
      try {
        let imageUrl = null;

        if (useExternalAPI) {
          utils.log("generateAitheme", "Generating image from external API...");
          try {
            const response = await axios.get(externalAPIUrl, {
              params: { prompt },
              timeout: 30000,
              validateStatus: (status) => status >= 200 && status < 600
            });

            if (response.status === 200 && response.data) {
              if (typeof response.data === 'string' && response.data.startsWith('http')) {
                imageUrl = response.data;
              } else if (response.data.url) {
                imageUrl = response.data.url;
              } else if (response.data.image) {
                imageUrl = response.data.image;
              }
              utils.log("generateAitheme", "External image generated:", imageUrl);
            }
          } catch (externalError) {
            utils.warn("generateAitheme", "External API failed, falling back to Facebook AI:", externalError.message);
          }
        }

        utils.log("generateAitheme", "Creating AI theme with prompt:", prompt);
        
        const form = {
          av: ctx.i_userID || ctx.userID,
          qpl_active_flow_ids: "25308101,25309433,521482085",
          fb_api_caller_class: "RelayModern",
          fb_api_req_friendly_name: "useGenerateAIThemeMutation",
          variables: JSON.stringify({
            input: {
              client_mutation_id: "1",
              actor_id: ctx.i_userID || ctx.userID,
              bypass_cache: true,
              caller: "MESSENGER",
              num_themes: 1,
              prompt: prompt,
              ...(imageUrl && { image_url: imageUrl })
            }
          }),
          server_timestamps: true,
          doc_id: "23873748445608673",
          fb_api_analytics_tags: JSON.stringify([
            "qpl_active_flow_ids=25308101,25309433,521482085"
          ]),
          fb_dtsg: ctx.fb_dtsg
        };

        const themeResponse = await defaultFuncs
          .post("https://web.facebook.com/api/graphql/", ctx.jar, form)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

        if (themeResponse.errors) {
          throw themeResponse.errors;
        }

        if (!themeResponse.data || !themeResponse.data.xfb_generate_ai_themes_from_prompt) {
          throw new Error("Invalid response from Facebook API");
        }

        const themes = themeResponse.data.xfb_generate_ai_themes_from_prompt.themes;
        
        if (!themes || themes.length === 0) {
          throw new Error("No themes generated");
        }

        const theme = themes[0];
        const themeFBID = theme.theme_id || theme.id;

        utils.log("generateAitheme", "Theme created successfully, applying to thread...");

        if (!ctx.mqttClient) {
          utils.warn("generateAitheme", "MQTT not connected, theme created but not applied");
          return callback(null, {
            success: true,
            theme: theme,
            themeFBID: themeFBID,
            applied: false,
            message: "Theme created but MQTT not available to apply it"
          });
        }

        ctx.wsReqNumber += 1;
        let baseTaskNumber = ++ctx.wsTaskNumber;

        const makeTask = (label, queueName, extraPayload = {}) => ({
          failure_count: null,
          label: String(label),
          payload: JSON.stringify({
            thread_key: threadID,
            theme_fbid: themeFBID,
            sync_group: 1,
            ...extraPayload,
          }),
          queue_name: typeof queueName === 'string' ? queueName : JSON.stringify(queueName),
          task_id: baseTaskNumber++,
        });

        const messages = [
          {
            label: 1013,
            queue: ['ai_generated_theme', String(threadID)],
          },
          {
            label: 1037,
            queue: ['msgr_custom_thread_theme', String(threadID)],
          },
          {
            label: 1028,
            queue: ['thread_theme_writer', String(threadID)],
          },
          {
            label: 43,
            queue: 'thread_theme',
            extra: { source: null, payload: null },
          },
        ].map(({ label, queue, extra }) => {
          ctx.wsReqNumber += 1;
          return {
            app_id: '772021112871879',
            payload: JSON.stringify({
              epoch_id: parseInt(utils.generateMessageID()),
              tasks: [makeTask(label, queue, extra)],
              version_id: '24227364673632991',
            }),
            request_id: ctx.wsReqNumber,
            type: 3,
          };
        });

        let publishedCount = 0;
        let publishError = null;

        messages.forEach((msg, idx) => {
          ctx.mqttClient.publish(
            '/ls_req',
            JSON.stringify(msg),
            { qos: 1, retain: false },
            (err) => {
              if (err && !publishError) {
                publishError = err;
              }
              publishedCount++;
              if (publishedCount === messages.length) {
                if (publishError) {
                  utils.warn("generateAitheme", "Theme applied with some errors:", publishError);
                }
                callback(null, {
                  success: true,
                  theme: theme,
                  themeFBID: themeFBID,
                  threadID: threadID,
                  applied: !publishError,
                  imageUrl: imageUrl
                });
              }
            }
          );
        });

      } catch (err) {
        utils.error("generateAitheme", err);
        callback(err);
      }
    };

    processAITheme();
    return returnPromise;
  };
};
